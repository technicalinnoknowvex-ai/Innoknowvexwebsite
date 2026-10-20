"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthStorage, getCurrentUser, loginWithPassword, persistAccessToken } from "../../lib/auth-api";
import styles from "../auth/AuthForm.module.css";
import PasswordInput from "../auth/PasswordInput";

export default function AdminLoginForm({ accessPending = false }) {
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
      const accessToken = authData?.session?.access_token;
      if (!accessToken) {
        throw new Error("Sign-in succeeded, but Supabase did not return a session.");
      }

      const user = await getCurrentUser(accessToken);
      if (typeof user?.app_metadata?.role !== "string" || user.app_metadata.role.toLowerCase() !== "admin") {
        clearAuthStorage();
        setError("This account is not approved for admin access yet. Ask an administrator to approve it in Supabase.");
        setIsSubmitting(false);
        return;
      }

      if (!persistAccessToken(authData)) {
        throw new Error("Unable to save your admin session. Please try again.");
      }
      router.replace("/auth/admin");
    } catch (submitError) {
      setError(submitError.message || "Unable to sign in. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {accessPending && (
        <p className={styles.success} role="status">
          Your account needs admin approval in Supabase before you can sign in here.
        </p>
      )}
      <label className={styles.field}>
        <span>Admin email</span>
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <div className={styles.field}>
        <label htmlFor="admin-login-password">Password</label>
        <PasswordInput id="admin-login-password" name="password" autoComplete="current-password" minLength={6} required />
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Checking access…" : "Sign in to admin"}
      </button>
      <p className={styles.switchPrompt}>
        Need an account? <Link href="/auth/admin/signup">Request admin access</Link>
      </p>
    </form>
  );
}
