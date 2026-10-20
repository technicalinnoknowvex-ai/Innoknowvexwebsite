"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { submitCollegePartnershipInquiry } from "../../../services/collegePartnershipService";
import { userFacingError } from "../../../lib/user-facing-error";
import styles from "./CollegePartnershipInquiry.module.css";

const partnershipOptions = [
  "Student training programs",
  "Internships and projects",
  "Placement and career support",
  "Institutional collaboration",
  "Other",
];

export default function CollegePartnershipInquiry({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const firstFieldRef = useRef(null);
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  function openForm() {
    previouslyFocusedRef.current = document.activeElement;
    setError("");
    setSubmitted(false);
    setIsOpen(true);
  }

  function closeForm() {
    if (isSubmitting) return;
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) {
      previouslyFocusedRef.current?.focus?.();
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const focusTimeout = window.setTimeout(
      () => firstFieldRef.current?.focus({ preventScroll: true }),
      0,
    );

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSubmitting) {
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll(
          "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)",
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
  }, [isOpen, isSubmitting]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const values = new FormData(form);

    try {
      await submitCollegePartnershipInquiry({
        collegeName: values.get("collegeName"),
        state: values.get("state"),
        city: values.get("city"),
        officialEmail: values.get("officialEmail"),
        contactName: values.get("contactName"),
        phone: values.get("phone"),
        partnershipInterest: values.get("partnershipInterest"),
        message: values.get("message"),
        contactConsent: values.get("contactConsent") === "on",
        sourcePage: window.location.pathname,
        website: values.get("website"),
      });
      form.reset();
      setSubmitted(true);
    } catch (submitError) {
      setError(userFacingError(submitError, "We couldn’t send your inquiry. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        className={`${styles.trigger} ${className}`.trim()}
        onClick={openForm}
        type="button"
      >
        Partner With Us
      </button>

      {isOpen &&
        createPortal(
          <div
            className={styles.backdrop}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeForm();
            }}
          >
          <section
            aria-labelledby="partnership-title"
            aria-modal="true"
            className={styles.dialog}
            ref={dialogRef}
            role="dialog"
          >
            <aside className={styles.intro}>
              <button
                aria-label="Close partnership inquiry"
                className={styles.mobileClose}
                onClick={closeForm}
                type="button"
              >
                ×
              </button>
              <span className={styles.eyebrow}>BUILD WITH INNOKNOWVEX</span>
              <h2 id="partnership-title">Let’s create more opportunities for your students.</h2>
              <p>
                Tell us about your institution. Our partnerships team will connect
                with you to explore the right collaboration.
              </p>
              <div className={styles.institutionBadge} aria-hidden="true">
                <span>INSTITUTIONAL</span>
                <strong>PARTNERSHIPS</strong>
              </div>
            </aside>

            <div className={styles.formPanel}>
              <button
                aria-label="Close partnership inquiry"
                className={styles.desktopClose}
                onClick={closeForm}
                type="button"
              >
                ×
              </button>

              {submitted ? (
                <div className={styles.success} role="status">
                  <span aria-hidden="true">✓</span>
                  <h3>Thank you for reaching out</h3>
                  <p>Our partnerships team will contact your institution soon.</p>
                  <button className={styles.submitButton} onClick={closeForm} type="button">
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <header className={styles.formHeading}>
                    <span className={styles.formEyebrow}>COLLEGE & INSTITUTION ENQUIRY</span>
                    <h3>Tell us about your college</h3>
                    <p>Fields marked with * are required.</p>
                  </header>

                  <form className={styles.form} onSubmit={handleSubmit}>
                    <label className={styles.field}>
                      <span>College / institution name *</span>
                      <input
                        autoComplete="organization"
                        maxLength={150}
                        minLength={2}
                        name="collegeName"
                        placeholder="e.g. City Institute of Technology"
                        ref={firstFieldRef}
                        required
                      />
                    </label>

                    <div className={styles.row}>
                      <label className={styles.field}>
                        <span>State *</span>
                        <input
                          autoComplete="address-level1"
                          maxLength={100}
                          name="state"
                          placeholder="State"
                          required
                        />
                      </label>
                      <label className={styles.field}>
                        <span>City *</span>
                        <input
                          autoComplete="address-level2"
                          maxLength={100}
                          name="city"
                          placeholder="City"
                          required
                        />
                      </label>
                    </div>

                    <label className={styles.field}>
                      <span>Official college email *</span>
                      <input
                        autoComplete="email"
                        maxLength={254}
                        name="officialEmail"
                        placeholder="name@college.edu"
                        required
                        type="email"
                      />
                    </label>

                    <div className={styles.row}>
                      <label className={styles.field}>
                        <span>Contact person *</span>
                        <input
                          autoComplete="name"
                          maxLength={100}
                          name="contactName"
                          placeholder="Your name"
                          required
                        />
                      </label>
                      <label className={styles.field}>
                        <span>Phone number *</span>
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

                    <label className={styles.field}>
                      <span>How would you like to partner? *</span>
                      <select defaultValue="" name="partnershipInterest" required>
                        <option disabled value="">Select a collaboration area</option>
                        {partnershipOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>

                    <label className={styles.field}>
                      <span>Anything else we should know? <small>Optional</small></span>
                      <textarea
                        maxLength={1000}
                        name="message"
                        placeholder="Tell us briefly about your students or goals."
                        rows={3}
                      />
                    </label>

                    <label aria-hidden="true" className={styles.honeypot}>
                      <span>Leave this field empty</span>
                      <input autoComplete="off" name="website" tabIndex={-1} />
                    </label>

                    <label className={styles.consent}>
                      <input name="contactConsent" required type="checkbox" />
                      <span>
                        I agree that Innoknowvex may contact me about institutional
                        partnership opportunities.
                      </span>
                    </label>

                    {error && <p className={styles.error} role="alert">{error}</p>}

                    <button
                      className={styles.submitButton}
                      disabled={isSubmitting}
                      type="submit"
                    >
                      {isSubmitting ? "Sending inquiry…" : "Send partnership inquiry"}
                      {!isSubmitting && <span aria-hidden="true">→</span>}
                    </button>
                    <p className={styles.privacyNote}>
                      Your details are only used to respond to this inquiry.
                    </p>
                  </form>
                </>
              )}
            </div>
          </section>
          </div>,
          document.body,
        )}
    </>
  );
}
