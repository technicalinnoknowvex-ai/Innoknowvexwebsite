const crypto = require("node:crypto");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabaseClient");
const {
  razorpayKeyId,
  razorpayKeySecret,
  supabaseServiceRoleKey,
  supabaseUrl,
} = require("../config/env");

const onlinePlans = new Set(["selfLearning", "mentorPaced", "professional"]);
const offlinePlan = "offline_all_inclusive";
const priceFields = {
  selfLearning: "self_current_price",
  mentorPaced: "mentor_current_price",
  professional: "professional_current_price",
};

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function adminClient() {
  if (!supabaseServiceRoleKey) {
    throw httpError(503, "Payment storage is not configured. Please contact support.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function razorpayClient() {
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw httpError(503, "Online payments are not configured yet. Please contact support.");
  }

  return new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
}

function normalizeCheckoutDetails(body) {
  const courseName = typeof body?.courseName === "string"
    ? body.courseName.trim().toLowerCase()
    : "";
  const planKey = typeof body?.planKey === "string" ? body.planKey.trim() : "";
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const couponCode = typeof body?.couponCode === "string"
    ? body.couponCode.trim().toUpperCase()
    : "";

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(courseName)) {
    throw httpError(400, "Choose a valid program.");
  }
  if (!fullName || fullName.length > 120) {
    throw httpError(400, "Enter your name (up to 120 characters).");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    throw httpError(400, "Enter a valid email address.");
  }
  if (!/^\+?[0-9][0-9\s()-]{7,18}$/.test(phone)) {
    throw httpError(400, "Enter a valid phone number.");
  }
  if (couponCode.length > 50) {
    throw httpError(400, "Coupon code must be 50 characters or fewer.");
  }

  const isOffline = courseName.startsWith("offline-");
  if (isOffline ? planKey !== offlinePlan : !onlinePlans.has(planKey)) {
    throw httpError(400, "Choose a valid learning plan.");
  }

  return {
    courseName,
    planKey,
    fullName,
    email,
    phone: phone.replace(/[^\d+]/g, ""),
    couponCode: couponCode || null,
    isOffline,
  };
}

async function createPaymentOrder(request, response) {
  const checkout = normalizeCheckoutDetails(request.body);
  const { data: pricing, error: pricingError } = await supabase
    .from("program_pricing_new")
    .select(
      "course_name, self_current_price, mentor_current_price, professional_current_price, currency",
    )
    .eq("course_name", checkout.courseName)
    .maybeSingle();

  if (pricingError) throw pricingError;
  if (!pricing) throw httpError(404, "Pricing for this program could not be found.");

  const amountInRupees = Number(
    pricing[checkout.isOffline ? "self_current_price" : priceFields[checkout.planKey]],
  );
  const amount = Math.round(amountInRupees * 100);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw httpError(400, "The current price for this program is invalid.");
  }

  const paymentGateway = razorpayClient();
  const recordId = crypto.randomUUID();
  const order = await paymentGateway.orders.create({
    amount,
    currency: pricing.currency,
    receipt: recordId,
    notes: {
      course_name: checkout.courseName,
      plan_key: checkout.planKey,
      user_id: request.user.id,
    },
  });

  const { error: insertError } = await adminClient()
    .from("program_enrollments")
    .insert({
      id: recordId,
      user_id: request.user.id,
      course_name: pricing.course_name,
      plan_key: checkout.planKey,
      full_name: checkout.fullName,
      email: checkout.email,
      phone: checkout.phone,
      coupon_code: checkout.couponCode,
      currency: pricing.currency,
      amount_paise: amount,
      razorpay_order_id: order.id,
      status: "pending",
    });

  if (insertError) throw insertError;

  response.status(201).json({
    data: {
      enrollmentId: recordId,
      orderId: order.id,
      keyId: razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      couponApplied: false,
    },
  });
}

function validSignature(orderId, paymentId, signature) {
  const expected = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();
  let received;

  try {
    received = Buffer.from(signature, "hex");
  } catch {
    return false;
  }

  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

async function verifyPayment(request, response) {
  const paymentGateway = razorpayClient();
  const { enrollmentId, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } =
    request.body || {};

  if (
    typeof enrollmentId !== "string" ||
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string" ||
    !validSignature(orderId, paymentId, signature)
  ) {
    throw httpError(400, "Payment verification failed. Please contact support if you were charged.");
  }

  const storage = adminClient();
  const { data: enrollment, error: enrollmentError } = await storage
    .from("program_enrollments")
    .select("id, user_id, razorpay_order_id, amount_paise, currency, status")
    .eq("id", enrollmentId)
    .eq("user_id", request.user.id)
    .maybeSingle();

  if (enrollmentError) throw enrollmentError;
  if (!enrollment || enrollment.razorpay_order_id !== orderId) {
    throw httpError(404, "The payment order could not be found for your account.");
  }
  if (enrollment.status === "paid") {
    response.json({ data: { status: "paid", enrollmentId } });
    return;
  }

  const payment = await paymentGateway.payments.fetch(paymentId);
  if (
    payment.order_id !== orderId ||
    payment.amount !== enrollment.amount_paise ||
    payment.currency !== enrollment.currency ||
    payment.status !== "captured"
  ) {
    throw httpError(400, "Payment has not been captured successfully.");
  }

  const { error: updateError } = await storage
    .from("program_enrollments")
    .update({
      razorpay_payment_id: paymentId,
      status: "paid",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", enrollmentId)
    .eq("user_id", request.user.id)
    .eq("status", "pending");

  if (updateError) throw updateError;

  response.json({ data: { status: "paid", enrollmentId } });
}

module.exports = { createPaymentOrder, verifyPayment };
