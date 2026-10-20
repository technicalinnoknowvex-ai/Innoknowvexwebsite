"use client";

import { useState } from "react";
import styles from "./AuthForm.module.css";

export default function PasswordInput({ name, ...inputProps }) {
  const [isVisible, setIsVisible] = useState(false);
  const visibilityLabel = isVisible ? "Hide password" : "Show password";

  return (
    <span className={styles.passwordWrapper}>
      <input
        {...inputProps}
        autoComplete={inputProps.autoComplete || "current-password"}
        name={name}
        type={isVisible ? "text" : "password"}
      />
      <button
        aria-label={visibilityLabel}
        aria-pressed={isVisible}
        className={styles.passwordVisibility}
        onClick={() => setIsVisible((visible) => !visible)}
        type="button"
      >
        {isVisible ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a16 16 0 0 1-3.2 4.1" />
            <path d="M6.2 6.2C3.9 7.8 3 12 3 12s3.5 7 9 7a10 10 0 0 0 4-.8" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </span>
  );
}
