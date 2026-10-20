"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../AuthForm.module.css";
import PasswordInput from "../PasswordInput";
import { getSafePostAuthPath } from "../../../lib/checkout";
import { loginWithPassword, persistAccessToken } from "../../../lib/auth-api";

export default function LoginForm({ verificationPending = false, redirectTo }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const authData = await loginWithPassword({
        email: String(formData.get("email")).trim(),
        password: String(formData.get("password")),
      });

      if (!persistAccessToken(authData)) {
        throw new Error("Login succeeded, but no session was returned. Please try again.");
      }

      router.replace(getSafePostAuthPath(redirectTo));
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
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
        <label htmlFor="login-password">Password</label>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          minLength={6}
          required
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {verificationPending && (
        <p className={styles.success} role="status">
          Account created. Check your inbox and spam folder for the verification link before signing in.
        </p>
      )}

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className={styles.switchPrompt}>
        New to Innoknowvex?{" "}
        <Link
          href={
            redirectTo
              ? `/auth/student/signup?next=${encodeURIComponent(redirectTo)}`
              : "/auth/student/signup"
          }
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
