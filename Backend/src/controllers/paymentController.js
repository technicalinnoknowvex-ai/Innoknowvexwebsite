const crypto = require("node:crypto");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabaseClient");
const {
  razorpayKeyId,
  razorpayKeySecret,
  razorpayWebhookSecret,
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
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function paymentStorageError(error, operation) {
  const code = error?.code;
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  let safeMessage =
    `Could not reach or query Supabase while ${operation}. Check the backend SUPABASE_URL, ` +
    "SUPABASE_SERVICE_ROLE_KEY, and database connectivity. If the enrollment table was not migrated, " +
    "run Backend/supabase/program_enrollments.sql in the Supabase SQL Editor.";
  let diagnosticCode = "STORAGE_ERROR";

  if (
    code === "PGRST204" ||
    code === "42703" ||
    (message.includes("idempotency_key") &&
      /column|schema cache|does not exist|could not find/.test(message))
  ) {
    safeMessage =
      "The payment database schema is out of date. Run Backend/supabase/program_enrollments.sql in the Supabase SQL Editor, then retry.";
    diagnosticCode = "STORAGE_SCHEMA_OUTDATED";
  } else if (code === "PGRST205" || code === "42P01") {
    safeMessage =
      "The payment enrollment table is missing. Run Backend/supabase/program_enrollments.sql in the Supabase SQL Editor, then retry.";
    diagnosticCode = "STORAGE_TABLE_MISSING";
  } else if (code === "42501") {
    safeMessage =
      "Payment storage permissions are not configured. Check the backend Supabase service-role configuration.";
    diagnosticCode = "STORAGE_PERMISSION_DENIED";
  } else if (
    /fetch failed|enotfound|eai_again|econnrefused|etimedout|network error|timed out/.test(
      message,
    )
  ) {
    safeMessage =
      "The backend cannot connect to Supabase. Check SUPABASE_URL, backend outbound network access, and that the Supabase project is available.";
    diagnosticCode = "STORAGE_UNREACHABLE";
  } else if (/invalid api key|invalid jwt|jwt.*invalid/.test(message)) {
    safeMessage =
      "Supabase rejected SUPABASE_SERVICE_ROLE_KEY. Replace it with the current service_role key from the Supabase project matching SUPABASE_URL, then restart the backend.";
    diagnosticCode = "STORAGE_SERVICE_KEY_REJECTED";
  } else if (typeof code === "string" && /^[A-Z0-9]+$/i.test(code)) {
    diagnosticCode = `STORAGE_DB_${code}`;
  }

  const wrapped = httpError(503, safeMessage);
  wrapped.diagnosticCode = diagnosticCode;
  return wrapped;
}

function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    throw httpError(503, "Payment storage is not configured. Please contact support.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function createRazorpayClient(keyId, keySecret) {
  if (!keyId || !keySecret) {
    throw httpError(503, "Online payments are not configured yet. Please contact support.");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function normalizeCheckoutDetails(body) {
  const courseName =
    typeof body?.courseName === "string" ? body.courseName.trim().toLowerCase() : "";
  const planKey = typeof body?.planKey === "string" ? body.planKey.trim() : "";
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const couponCode =
    typeof body?.couponCode === "string" ? body.couponCode.trim().toUpperCase() : "";
  const idempotencyKey =
    typeof body?.idempotencyKey === "string" ? body.idempotencyKey.trim() : "";

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(courseName)) {
    throw httpError(400, "Choose a valid program.");
  }
  if (!uuidPattern.test(idempotencyKey)) {
    throw httpError(400, "Checkout request is invalid. Please refresh and try again.");
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
    idempotencyKey,
    isOffline,
  };
}

function asHttpError(error, fallbackMessage) {
  const providerError = error?.error;
  const status = error?.statusCode || error?.status || providerError?.statusCode;
  const providerCode = error?.code || providerError?.code;
  const description = `${error?.message || ""} ${providerError?.description || ""}`.toLowerCase();

  if (
    status === 401 ||
    providerCode === "AUTHENTICATION_ERROR" ||
    /invalid api key|authentication failed|invalid key/.test(description)
  ) {
    return httpError(
      502,
      "Razorpay rejected the configured API key. Check that the Key ID and Key Secret are a matching, active pair from the same test or live mode.",
    );
  }

  return httpError(502, fallbackMessage);
}

function getGateway(getClient) {
  try {
    return getClient();
  } catch (error) {
    if (error?.statusCode) throw error;
    throw asHttpError(error, "Unable to connect to Razorpay. Please try again.");
  }
}

function validHmac(value, secret, message) {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/i.test(value)) return false;
  const expected = crypto.createHmac("sha256", secret).update(message).digest();
  const received = Buffer.from(value, "hex");
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

function createPaymentController(dependencies = {}) {
  const pricingClient = dependencies.pricingClient || supabase;
  const createStorage = dependencies.createStorage || createAdminClient;
  const keyId =
    Object.prototype.hasOwnProperty.call(dependencies, "keyId")
      ? dependencies.keyId
      : razorpayKeyId;
  const keySecret =
    Object.prototype.hasOwnProperty.call(dependencies, "keySecret")
      ? dependencies.keySecret
      : razorpayKeySecret;
  const webhookSecret =
    Object.prototype.hasOwnProperty.call(dependencies, "webhookSecret")
      ? dependencies.webhookSecret
      : razorpayWebhookSecret;
  const getClient =
    dependencies.getGateway ||
    (() => createRazorpayClient(keyId, keySecret));

  async function findEnrollment(storage, filters) {
    let query = storage
      .from("program_enrollments")
      .select(
        "id, user_id, course_name, plan_key, full_name, email, phone, coupon_code, idempotency_key, razorpay_order_id, razorpay_payment_id, amount_paise, currency, status",
      );

    for (const [field, value] of Object.entries(filters)) {
      query = query.eq(field, value);
    }

    let result;
    try {
      result = await query.maybeSingle();
    } catch (error) {
      throw paymentStorageError(error, "reading the enrollment");
    }
    const { data, error } = result;
    if (error) throw paymentStorageError(error, "reading the enrollment");
    return data;
  }

  function assertSameCheckout(enrollment, checkout) {
    if (
      enrollment.course_name !== checkout.courseName ||
      enrollment.plan_key !== checkout.planKey ||
      enrollment.full_name !== checkout.fullName ||
      enrollment.email !== checkout.email ||
      enrollment.phone !== checkout.phone ||
      enrollment.coupon_code !== checkout.couponCode
    ) {
      throw httpError(
        409,
        "This checkout request was already used for a different program or plan. Refresh checkout and try again.",
      );
    }
    if (enrollment.status === "paid") {
      throw httpError(409, "This enrollment has already been paid.");
    }
  }

  function sendExistingOrder(response, enrollment) {
    response.status(200).json({
      data: {
        enrollmentId: enrollment.id,
        orderId: enrollment.razorpay_order_id,
        keyId,
        amount: enrollment.amount_paise,
        currency: enrollment.currency,
        couponApplied: false,
      },
    });
  }

  async function createPaymentOrder(request, response) {
    const checkout = normalizeCheckoutDetails(request.body);
    const storage = createStorage();
    const existing = await findEnrollment(storage, {
      user_id: request.user.id,
      idempotency_key: checkout.idempotencyKey,
    });

    if (existing) {
      assertSameCheckout(existing, checkout);
      sendExistingOrder(response, existing);
      return;
    }

    let pricingResult;
    try {
      pricingResult = await pricingClient
        .from("program_pricing_new")
        .select(
          "course_name, self_current_price, mentor_current_price, professional_current_price, currency",
        )
        .eq("course_name", checkout.courseName)
        .maybeSingle();
    } catch (error) {
      throw paymentStorageError(error, "reading program pricing");
    }
    const { data: pricing, error: pricingError } = pricingResult;

    if (pricingError) throw paymentStorageError(pricingError, "reading program pricing");
    if (!pricing) throw httpError(404, "Pricing for this program could not be found.");
    if (pricing.currency !== "INR") {
      throw httpError(400, "This program does not have a supported payment currency.");
    }

    const amountInRupees = Number(
      pricing[checkout.isOffline ? "self_current_price" : priceFields[checkout.planKey]],
    );
    const amount = Math.round(amountInRupees * 100);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw httpError(400, "The current price for this program is invalid.");
    }
    if (!keyId || !keySecret) {
      throw httpError(503, "Online payments are not configured yet. Please contact support.");
    }

    const gateway = getGateway(getClient);
    let order;
    try {
      order = await gateway.orders.create({
        amount,
        currency: pricing.currency,
        receipt: crypto.randomUUID(),
        notes: {
          course_name: checkout.courseName,
          plan_key: checkout.planKey,
          user_id: request.user.id,
        },
      });
    } catch (error) {
      throw asHttpError(error, "Razorpay could not create the payment order. Please try again.");
    }
    if (
      typeof order?.id !== "string" ||
      order.amount !== amount ||
      order.currency !== pricing.currency
    ) {
      throw httpError(502, "Razorpay returned incomplete order details. Please try again.");
    }

    const enrollmentId = crypto.randomUUID();
    const { error: insertError } = await storage.from("program_enrollments").insert({
      id: enrollmentId,
      user_id: request.user.id,
      course_name: pricing.course_name,
      plan_key: checkout.planKey,
      idempotency_key: checkout.idempotencyKey,
      full_name: checkout.fullName,
      email: checkout.email,
      phone: checkout.phone,
      coupon_code: checkout.couponCode,
      currency: pricing.currency,
      amount_paise: amount,
      razorpay_order_id: order.id,
      status: "pending",
    });

    if (insertError) {
      if (insertError.code === "23505") {
        const concurrentEnrollment = await findEnrollment(storage, {
          user_id: request.user.id,
          idempotency_key: checkout.idempotencyKey,
        });
        if (concurrentEnrollment) {
          assertSameCheckout(concurrentEnrollment, checkout);
          sendExistingOrder(response, concurrentEnrollment);
          return;
        }
      }
      throw paymentStorageError(insertError, "saving the enrollment");
    }

    response.status(201).json({
      data: {
        enrollmentId,
        orderId: order.id,
        keyId,
        amount: order.amount,
        currency: order.currency,
        couponApplied: false,
      },
    });
  }

  async function markPaymentCaptured(storage, enrollment, payment) {
    if (
      !payment ||
      payment.order_id !== enrollment.razorpay_order_id ||
      payment.amount !== enrollment.amount_paise ||
      payment.currency !== enrollment.currency ||
      payment.status !== "captured" ||
      typeof payment.id !== "string" ||
      !payment.id
    ) {
      throw httpError(400, "Payment has not been captured successfully.");
    }

    if (enrollment.status === "paid") {
      if (enrollment.razorpay_payment_id === payment.id) return;
      throw httpError(409, "This enrollment was already completed with another payment.");
    }

    let updateResult;
    try {
      updateResult = await storage
        .from("program_enrollments")
        .update({
          razorpay_payment_id: payment.id,
          status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", enrollment.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();
    } catch (error) {
      throw paymentStorageError(error, "confirming the enrollment");
    }
    const { data: updated, error: updateError } = updateResult;

    if (updateError) throw paymentStorageError(updateError, "confirming the enrollment");
    if (updated) return;

    const latest = await findEnrollment(storage, { id: enrollment.id });
    if (latest?.status === "paid" && latest.razorpay_payment_id === payment.id) return;
    throw httpError(409, "The enrollment payment state changed. Refresh and check your enrollment.");
  }

  async function verifyPayment(request, response) {
    const body = request.body || {};
    const enrollmentId = body.enrollmentId;
    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;

    if (!keySecret) {
      throw httpError(503, "Online payments are not configured yet. Please contact support.");
    }
    if (
      typeof enrollmentId !== "string" ||
      !uuidPattern.test(enrollmentId) ||
      typeof orderId !== "string" ||
      !orderId ||
      orderId.length > 100 ||
      typeof paymentId !== "string" ||
      !paymentId ||
      paymentId.length > 100 ||
      !validHmac(signature, keySecret, `${orderId}|${paymentId}`)
    ) {
      throw httpError(400, "Payment verification failed. Please contact support if you were charged.");
    }

    const storage = createStorage();
    const enrollment = await findEnrollment(storage, {
      id: enrollmentId,
      user_id: request.user.id,
    });

    if (!enrollment || enrollment.razorpay_order_id !== orderId) {
      throw httpError(404, "The payment order could not be found for your account.");
    }
    if (enrollment.status === "paid") {
      if (enrollment.razorpay_payment_id === paymentId) {
        response.json({ data: { status: "paid", enrollmentId } });
        return;
      }
      throw httpError(409, "This enrollment was already completed with another payment.");
    }

    const gateway = getGateway(getClient);
    let payment;
    try {
      payment = await gateway.payments.fetch(paymentId);
    } catch (error) {
      throw asHttpError(error, "Razorpay could not confirm this payment. Please try again.");
    }

    await markPaymentCaptured(storage, enrollment, payment);
    response.json({ data: { status: "paid", enrollmentId } });
  }

  async function handleWebhook(request, response) {
    if (!webhookSecret) {
      throw httpError(503, "Payment webhook is not configured. Please contact support.");
    }

    const rawBody = request.body;
    const signature = request.get("x-razorpay-signature");
    if (
      !Buffer.isBuffer(rawBody) ||
      !validHmac(signature, webhookSecret, rawBody)
    ) {
      throw httpError(400, "Webhook signature verification failed.");
    }

    let event;
    try {
      event = JSON.parse(rawBody.toString("utf8"));
    } catch {
      throw httpError(400, "Webhook payload is invalid.");
    }

    if (!["payment.captured", "order.paid"].includes(event.event)) {
      response.status(200).json({ received: true });
      return;
    }

    const payment = event.payload?.payment?.entity;
    const orderId =
      payment?.order_id || event.payload?.order?.entity?.id;
    if (typeof orderId !== "string" || !payment) {
      throw httpError(400, "Webhook payment details are incomplete.");
    }

    const storage = createStorage();
    const enrollment = await findEnrollment(storage, { razorpay_order_id: orderId });
    if (!enrollment) {
      throw httpError(404, "The enrollment for this payment order could not be found.");
    }

    await markPaymentCaptured(storage, enrollment, payment);
    response.status(200).json({ received: true });
  }

  return { createPaymentOrder, verifyPayment, handleWebhook };
}

const controller = createPaymentController();

module.exports = {
  ...controller,
  createPaymentController,
  validHmac,
};
