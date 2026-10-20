"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearAuthStorage, getCurrentUser } from "../../lib/auth-api";
import { createPaymentOrder, verifyPayment } from "../../services/paymentService";
import { userFacingError } from "../../lib/user-facing-error";
import styles from "./CheckoutClient.module.css";

const razorpayScriptUrl = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = razorpayScriptUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayScriptPromise = null;
      reject(new Error("Unable to load Razorpay checkout. Please try again."));
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

function getPlanLabel(plan) {
  if (plan === "offline_all_inclusive") return "Complete Offline Program";
  if (plan === "mentorPaced") return "Mentor-Paced";
  if (plan === "professional") return "Professional";
  return "Self-Learning";
}

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseName = searchParams.get("courseName") || "";
  const planKey = searchParams.get("plan") || "";
  const programTitle = searchParams.get("programTitle") || "Selected program";
  const [accessToken, setAccessToken] = useState("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [details, setDetails] = useState({ fullName: "", email: "", phone: "", couponCode: "" });
  const submitInProgress = useRef(false);
  const idempotencyKey = useRef("");
  const idempotencyContext = useRef("");

  useEffect(() => {
    let isCurrent = true;
    const token = window.sessionStorage.getItem("innoknowvex_access_token");

    if (!token) {
      const nextPath = `${window.location.pathname}${window.location.search}`;
      router.replace(`/auth/student/login?next=${encodeURIComponent(nextPath)}`);
      return () => {
        isCurrent = false;
      };
    }

    getCurrentUser(token)
      .then((user) => {
        if (!isCurrent) return;
        setAccessToken(token);
        setDetails((current) => ({
          ...current,
          fullName: user?.user_metadata?.full_name || "",
          email: user?.email || "",
          phone: user?.user_metadata?.phone || "",
        }));
      })
      .catch((userError) => {
        if (!isCurrent) return;
        if (userError.status === 401) {
          clearAuthStorage();
          const nextPath = `${window.location.pathname}${window.location.search}`;
          router.replace(`/auth/student/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }
        setError(userFacingError(userError, "We couldn’t verify your account. Please sign in again."));
      })
      .finally(() => {
        if (isCurrent) setIsLoadingUser(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitInProgress.current) return;
    submitInProgress.current = true;
    setError("");
    setIsSubmitting(true);

    try {
      await loadRazorpayScript();
      const currentCheckoutContext = JSON.stringify([
        courseName,
        planKey,
        details.fullName,
        details.email,
        details.phone,
        details.couponCode,
      ]);
      if (idempotencyContext.current !== currentCheckoutContext) {
        idempotencyKey.current = window.crypto.randomUUID();
        idempotencyContext.current = currentCheckoutContext;
      }
      const order = await createPaymentOrder(accessToken, {
        courseName,
        planKey,
        fullName: details.fullName,
        email: details.email,
        phone: details.phone,
        couponCode: details.couponCode,
        idempotencyKey: idempotencyKey.current,
      });

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Innoknowvex",
        description: `${programTitle} — ${getPlanLabel(planKey)}`,
        order_id: order.orderId,
        prefill: {
          name: details.fullName,
          email: details.email,
          contact: details.phone,
        },
        theme: { color: "#087cf0" },
        handler: async (paymentResponse) => {
          try {
            const verification = await verifyPayment(accessToken, {
              enrollmentId: order.enrollmentId,
              ...paymentResponse,
            });
            if (
              verification.status !== "paid" ||
              verification.enrollmentId !== order.enrollmentId
            ) {
              throw new Error("The server could not confirm this payment. Please contact support.");
            }
            setIsPaid(true);
          } catch (verificationError) {
            setError(
              `${userFacingError(verificationError, "We couldn’t confirm your payment.")} If your account was charged, please contact support with your payment ID.`,
            );
          } finally {
            submitInProgress.current = false;
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            submitInProgress.current = false;
            setIsSubmitting(false);
          },
        },
      });

      checkout.on("payment.failed", (paymentFailure) => {
        setError(
          userFacingError(
            paymentFailure.error?.description,
            "The payment didn’t complete. You can try again.",
          ),
        );
        submitInProgress.current = false;
        setIsSubmitting(false);
      });
      checkout.open();
    } catch (checkoutError) {
      setError(userFacingError(checkoutError, "We couldn’t start checkout. Please try again."));
      submitInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  if (!courseName || !planKey) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1>Checkout details are missing</h1>
          <p>Please select a program and learning plan before continuing.</p>
          <Link href="/programs">Browse programs</Link>
        </section>
      </main>
    );
  }

  if (isPaid) {
    return (
      <main className={styles.page}>
        <section className={styles.card} role="status">
          <span className={styles.successIcon} aria-hidden="true">✓</span>
          <p className={styles.eyebrow}>PAYMENT CONFIRMED</p>
          <h1>You’re enrolled!</h1>
          <p>Your payment was verified and your enrollment has been recorded.</p>
          <Link className={styles.secondaryLink} href="/auth/student/dashboard">
            Go to your dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.checkoutLayout}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>SECURE CHECKOUT</p>
          <h1>Complete your enrollment</h1>
          <p>Confirm your contact details, then continue securely with Razorpay.</p>
        </div>
        <aside className={styles.summary}>
          <span className={styles.summaryLabel}>YOUR SELECTION</span>
          <h2>{programTitle}</h2>
          <p>{getPlanLabel(planKey)}</p>
          <span className={styles.secureNote}>🔒 Payment is securely processed by Razorpay.</span>
        </aside>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Full name</span>
            <input
              autoComplete="name"
              maxLength={120}
              onChange={(event) => setDetails((current) => ({ ...current, fullName: event.target.value }))}
              required
              value={details.fullName}
            />
          </label>
          <label className={styles.field}>
            <span>Phone number</span>
            <input
              autoComplete="tel"
              maxLength={20}
              onChange={(event) => setDetails((current) => ({ ...current, phone: event.target.value }))}
              required
              type="tel"
              value={details.phone}
            />
          </label>
          <label className={styles.field}>
            <span>Email address</span>
            <input
              autoComplete="email"
              maxLength={254}
              onChange={(event) => setDetails((current) => ({ ...current, email: event.target.value }))}
              required
              type="email"
              value={details.email}
            />
          </label>
          <label className={styles.field}>
            <span>Coupon code <small>Optional</small></span>
            <input
              autoCapitalize="characters"
              maxLength={50}
              onChange={(event) => setDetails((current) => ({ ...current, couponCode: event.target.value }))}
              placeholder="Enter a coupon code"
              value={details.couponCode}
            />
          </label>
          <p className={styles.couponNote}>
            Coupon codes are recorded for manual review and do not change the price yet.
          </p>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button className={styles.payButton} disabled={isLoadingUser || isSubmitting || !accessToken} type="submit">
            {isLoadingUser ? "Verifying account…" : isSubmitting ? "Opening secure checkout…" : "Continue to payment"}
            {!isLoadingUser && !isSubmitting && <span aria-hidden="true">→</span>}
          </button>
          <Link className={styles.backLink} href={`/programs/${encodeURIComponent(courseName)}`}>
            Back to program
          </Link>
        </form>
      </section>
      <p className={styles.securityFootnote}>
        Your enrollment is marked complete only after payment is verified by the server.
      </p>
    </main>
  );
}
