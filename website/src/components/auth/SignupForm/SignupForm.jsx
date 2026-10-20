"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../AuthForm.module.css";
import PasswordInput from "../PasswordInput";
import { getSafePostAuthPath } from "../../../lib/checkout";
import { persistAccessToken, registerWithPassword } from "../../../lib/auth-api";
import { userFacingError } from "../../../lib/user-facing-error";

export default function SignupForm({ redirectTo }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

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

      if (Array.isArray(authData?.user?.identities) && authData.user.identities.length === 0) {
        setError("An account may already exist with this email. Try signing in instead.");
        setIsSubmitting(false);
        return;
      }

      if (persistAccessToken(authData)) {
        router.replace(getSafePostAuthPath(redirectTo));
        return;
      }
      const nextQuery = redirectTo ? `&next=${encodeURIComponent(redirectTo)}` : "";
      router.replace(`/auth/student/login?verification=pending${nextQuery}`);
    } catch (submitError) {
      setError(userFacingError(submitError, "We couldn’t create your account. Please try again."));
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

      <div className={styles.field}>
        <label htmlFor="signup-password">Password</label>
        <PasswordInput
          id="signup-password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          minLength={6}
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="signup-confirm-password">Confirm password</label>
        <PasswordInput
          id="signup-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Enter your password again"
          minLength={6}
          required
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className={styles.switchPrompt}>
        Already have an account?{" "}
        <Link
          href={
            redirectTo
              ? `/auth/student/login?next=${encodeURIComponent(redirectTo)}`
              : "/auth/student/login"
          }
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
