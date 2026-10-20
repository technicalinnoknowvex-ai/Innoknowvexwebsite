"use client";

import Link from "next/link";
import { useState } from "react";
import { registerWithPassword } from "../../lib/auth-api";
import styles from "../auth/AuthForm.module.css";
import PasswordInput from "../auth/PasswordInput";
import { userFacingError } from "../../lib/user-facing-error";

export default function AdminSignupForm() {
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerWithPassword({
        fullName: String(formData.get("fullName")).trim(),
        email: String(formData.get("email")).trim(),
        password,
        confirmPassword,
        redirectTo: "/auth/admin/login",
      });
      if (Array.isArray(result?.user?.identities) && result.user.identities.length === 0) {
        throw new Error("An account may already exist with this email. Try signing in.");
      }
      setSubmitted(true);
    } catch (submitError) {
      setError(userFacingError(submitError, "We couldn’t submit your request. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.form}>
        <p className={styles.success} role="status">
          Your request has been submitted. Our administration team will review it and contact you about your admin access.
        </p>
        <p className={styles.switchPrompt}><Link href="/auth/admin/login">Continue to admin sign in</Link></p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.success} role="note">
        Admin access is available after approval by our administration team. We’ll review your request and contact you with an update.
      </p>
      <label className={styles.field}>
        <span>Full name</span>
        <input name="fullName" autoComplete="name" maxLength={120} required />
      </label>
      <label className={styles.field}>
        <span>Email address</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <div className={styles.field}>
        <label htmlFor="admin-signup-password">Password</label>
        <PasswordInput id="admin-signup-password" name="password" autoComplete="new-password" minLength={6} required />
      </div>
      <div className={styles.field}>
        <label htmlFor="admin-signup-confirm-password">Confirm password</label>
        <PasswordInput id="admin-signup-confirm-password" name="confirmPassword" autoComplete="new-password" minLength={6} required />
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting request…" : "Request admin access"}
      </button>
      <p className={styles.switchPrompt}>
        Already have an account? <Link href="/auth/admin/login">Sign in</Link>
      </p>
    </form>
  );
}
