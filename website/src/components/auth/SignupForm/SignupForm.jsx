"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../AuthForm.module.css";
import { persistAccessToken, registerWithPassword } from "../../../lib/auth-api";

export default function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const authData = await registerWithPassword({
        fullName: String(formData.get("fullName")).trim(),
        email: String(formData.get("email")).trim(),
        password,
        confirmPassword,
      });

      if (persistAccessToken(authData)) {
        router.replace("/");
        return;
      }

      setSuccess("Your account is created. Check your email to confirm your address, then sign in.");
      setIsSubmitting(false);
    } catch (submitError) {
      setError(submitError.message || "Unable to create your account. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span>Full name</span>
        <input
          type="text"
          name="fullName"
          autoComplete="name"
          placeholder="Your full name"
          maxLength={120}
          required
        />
      </label>

      <label className={styles.field}>
        <span>Email address</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </label>

      <label className={styles.field}>
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          minLength={6}
          required
        />
      </label>

      <label className={styles.field}>
        <span>Confirm password</span>
        <input
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Enter your password again"
          minLength={6}
          required
        />
      </label>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className={styles.success} role="status">
          {success}
        </p>
      )}

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className={styles.switchPrompt}>
        Already have an account? <Link href="/auth/student/login">Sign in</Link>
      </p>
    </form>
  );
}
