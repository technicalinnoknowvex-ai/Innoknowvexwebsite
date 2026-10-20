"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { submitStudentLead } from "../../../services/studentLeadService";
import styles from "./StudentGuidancePopup.module.css";

const AUTO_OPEN_DELAY_MS = 5500;
const SUBMISSION_KEY = "student-guidance-submitted";
const SESSION_SHOWN_KEY = "student-guidance-auto-shown";

const trainingOptions = [
  "AI & Data Science",
  "Web Development",
  "Cybersecurity",
  "Digital Marketing",
  "Business & Finance",
  "Other",
];

const languageOptions = ["English", "Hindi", "Telugu", "Other"];

function shouldAutoOpen() {
  if (window.sessionStorage.getItem(SESSION_SHOWN_KEY)) return false;
  return !window.localStorage.getItem(SUBMISSION_KEY);
}

export default function StudentGuidancePopup() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const dialogRef = useRef(null);
  const autoOpenTimeoutRef = useRef(null);
  const firstFieldRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const isHiddenPage =
    pathname?.startsWith("/auth/") ||
    pathname === "/checkout" ||
    pathname?.startsWith("/admin");

  const closePopup = useCallback(() => {
    window.clearTimeout(autoOpenTimeoutRef.current);
    setIsOpen(false);
  }, []);

  const openPopup = useCallback(() => {
    window.clearTimeout(autoOpenTimeoutRef.current);
    window.sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
    setError("");
    setSuccessMessage("");
    previouslyFocusedRef.current = document.activeElement;
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (isHiddenPage || !shouldAutoOpen()) return undefined;

    autoOpenTimeoutRef.current = window.setTimeout(() => {
      openPopup();
    }, AUTO_OPEN_DELAY_MS);

    return () => window.clearTimeout(autoOpenTimeoutRef.current);
  }, [isHiddenPage, openPopup, pathname]);

  useEffect(() => {
    function handleContactRequest() {
      openPopup();
    }

    window.addEventListener("open-student-guidance", handleContactRequest);
    return () =>
      window.removeEventListener("open-student-guidance", handleContactRequest);
  }, [openPopup]);

  useEffect(() => {
    if (!isOpen) {
      previouslyFocusedRef.current?.focus?.();
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const focusTimeout = window.setTimeout(() => firstFieldRef.current?.focus(), 0);

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSubmitting) {
        closePopup();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll(
          "button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]",
        ) || [],
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimeout);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePopup, isOpen, isSubmitting]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const result = await submitStudentLead({
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        trainingInterest: formData.get("trainingInterest"),
        preferredLanguage: formData.get("preferredLanguage"),
        contactConsent: formData.get("contactConsent") === "on",
        sourcePage: window.location.pathname,
        website: formData.get("website"),
      });
      window.localStorage.setItem(SUBMISSION_KEY, "true");
      setSuccessMessage(result.message || "Thank you. A counselor will contact you soon.");
      form.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn't send your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isHiddenPage) return null;

  return (
    <>
      {isOpen && (
        <div
          className={styles.backdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) closePopup();
          }}
        >
          <section
            aria-labelledby="guidance-title"
            aria-modal="true"
            className={styles.dialog}
            ref={dialogRef}
            role="dialog"
          >
            <aside className={styles.introPanel}>
              <button
                aria-label="Close guidance form"
                className={styles.mobileClose}
                onClick={() => closePopup()}
                type="button"
              >
                ×
              </button>
              <span className={styles.eyebrow}>YOUR NEXT STEP STARTS HERE</span>
              <h2 id="guidance-title">A little guidance can change a lot.</h2>
              <p>
                Tell us what you want to learn. A friendly counselor can help you
                find a training path that fits your goals.
              </p>
              <ul className={styles.highlights}>
                <li><span aria-hidden="true">✓</span> Get help choosing a program</li>
                <li><span aria-hidden="true">✓</span> Ask questions at your pace</li>
                <li><span aria-hidden="true">✓</span> Choose your preferred language</li>
              </ul>
              <span className={styles.noPressure}>No pressure. Just helpful guidance.</span>
            </aside>

            <div className={styles.formPanel}>
              <button
                aria-label="Close guidance form"
                className={styles.desktopClose}
                onClick={() => closePopup()}
                type="button"
              >
                ×
              </button>

              {successMessage ? (
                <div className={styles.success} role="status">
                  <span aria-hidden="true" className={styles.successIcon}>✓</span>
                  <h3>You&apos;re all set!</h3>
                  <p>{successMessage}</p>
                  <button
                    className={styles.submitButton}
                    onClick={closePopup}
                    type="button"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.formHeading}>
                    <span className={styles.formEyebrow}>FREE COUNSELOR CALL</span>
                    <h3>Let’s find your fit</h3>
                    <p>Share a few details and we’ll get in touch.</p>
                  </div>

                  <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.field}>
                      <span>Your name</span>
                      <input
                        autoComplete="name"
                        maxLength={100}
                        minLength={2}
                        name="fullName"
                        placeholder="e.g. Ananya Sharma"
                        ref={firstFieldRef}
                        required
                      />
                    </label>

                    <div className={styles.fieldRow}>
                      <label className={styles.field}>
                        <span>Email address</span>
                        <input
                          autoComplete="email"
                          maxLength={254}
                          name="email"
                          placeholder="you@example.com"
                          required
                          type="email"
                        />
                      </label>
                      <label className={styles.field}>
                        <span>Phone number</span>
                        <input
                          autoComplete="tel"
                          maxLength={30}
                          name="phone"
                          placeholder="+91 98765 43210"
                          required
                          type="tel"
                        />
                      </label>
                    </div>

                    <div className={styles.fieldRow}>
                      <label className={styles.field}>
                        <span>What are you interested in?</span>
                        <select defaultValue="" name="trainingInterest" required>
                          <option disabled value="">Choose a training area</option>
                          {trainingOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                      <label className={styles.field}>
                        <span>Preferred language</span>
                        <select defaultValue="" name="preferredLanguage" required>
                          <option disabled value="">Choose a language</option>
                          {languageOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label aria-hidden="true" className={styles.honeypot}>
                      <span>Leave this field empty</span>
                      <input
                        autoComplete="off"
                        name="website"
                        tabIndex={-1}
                      />
                    </label>

                    <label className={styles.consent}>
                      <input name="contactConsent" required type="checkbox" />
                      <span>
                        I agree that an Innoknowvex counselor may contact me about
                        training guidance.
                      </span>
                    </label>

                    {error && <p className={styles.error} role="alert">{error}</p>}

                    <button
                      className={styles.submitButton}
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? "Sending your request…" : "Request free guidance"}
                      {!isSubmitting && <span aria-hidden="true">→</span>}
                    </button>
                    <p className={styles.privacyNote}>
                      Your details are only used to respond to this request.
                    </p>
                  </form>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
