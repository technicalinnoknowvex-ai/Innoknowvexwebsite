"use client";

import { useEffect, useState } from "react";
import Header from "../layout/Header/Header";
import Footer from "../layout/Footer/Footer";
import LoadingIndicator from "../common/LoadingIndicator/LoadingIndicator";
import { getOpenCareerJobs, submitCareerApplication } from "../../services/careerService";
import { userFacingError } from "../../lib/user-facing-error";
import styles from "./CareersPage.module.css";

function JobApplicationForm({ job, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      values.set("jobId", job.id);
      await submitCareerApplication(values);
      setSuccess(true);
      form.reset();
    } catch (submitError) {
      setError(userFacingError(submitError, "We couldn’t submit your application. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={styles.applicationSuccess} role="status">
        <span aria-hidden="true">✓</span>
        <div>
          <h4>Application submitted</h4>
          <p>Thank you for your interest in the {job.title} role. Our team will be in touch.</p>
        </div>
        <button className={styles.textButton} onClick={onCancel} type="button">Close</button>
      </div>
    );
  }

  return (
    <form className={styles.applicationForm} onSubmit={handleSubmit}>
      <div className={styles.applicationHeading}>
        <div>
          <p className={styles.formEyebrow}>APPLY FOR THIS ROLE</p>
          <h4>{job.title}</h4>
        </div>
        <button
          aria-label="Close application form"
          className={styles.formClose}
          onClick={onCancel}
          type="button"
        >
          ×
        </button>
      </div>

      <label className={styles.field}>
        <span>Full name *</span>
        <input autoComplete="name" maxLength={100} minLength={2} name="fullName" required />
      </label>

      <div className={styles.formRow}>
        <label className={styles.field}>
          <span>Email *</span>
          <input autoComplete="email" maxLength={254} name="email" required type="email" />
        </label>
        <label className={styles.field}>
          <span>Phone *</span>
          <input autoComplete="tel" maxLength={30} name="phone" required type="tel" />
        </label>
      </div>

      <div className={styles.formRow}>
        <label className={styles.field}>
          <span>Upload resume (PDF, up to 5 MB) *</span>
          <input accept="application/pdf,.pdf" name="resume" required type="file" />
        </label>
        <label className={styles.field}>
          <span>LinkedIn profile <small>Optional</small></span>
          <input maxLength={2048} name="linkedinUrl" placeholder="https://…" type="url" />
        </label>
      </div>

      <label className={styles.field}>
        <span>Message <small>Optional</small></span>
        <textarea maxLength={2000} name="message" placeholder="Tell us a little about your experience." rows={3} />
      </label>

      <label aria-hidden="true" className={styles.honeypot}>
        <span>Leave this field empty</span>
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>

      <label className={styles.consent}>
        <input name="contactConsent" required type="checkbox" />
        <span>I agree that Innoknowvex may contact me about this application.</span>
      </label>

      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.formActions}>
        <button className={styles.cancelButton} disabled={isSubmitting} onClick={onCancel} type="button">
          Cancel
        </button>
        <button className={styles.applyButton} disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting…" : "Submit application"}
          {!isSubmitting && <span aria-hidden="true">→</span>}
        </button>
      </div>
      <p className={styles.privacyNote}>Your information is used only to review and respond to your application.</p>
    </form>
  );
}

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicationJobId, setApplicationJobId] = useState("");

  async function fetchJobs() {
    try {
      setJobs(await getOpenCareerJobs());
    } catch (loadError) {
      setError(userFacingError(loadError, "We couldn’t load current openings. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadJobs() {
    setIsLoading(true);
    setError("");
    await fetchJobs();
  }

  useEffect(() => {
    let isMounted = true;
    getOpenCareerJobs()
      .then((data) => {
        if (isMounted) setJobs(data);
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(userFacingError(loadError, "We couldn’t load current openings. Please try again."));
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Header activeItem="Careers" />
      <main className={styles.page}>
        <section className={styles.hero}>
          <span className={styles.heroOrb} aria-hidden="true" />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>GROW WITH US</p>
            <h1>Do work that opens doors.</h1>
            <p>
              Join a team building practical learning and meaningful opportunities
              for the next generation.
            </p>
            <a className={styles.heroLink} href="#open-roles">
              Explore open roles <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className={styles.heroMark} aria-hidden="true">
            <span>LEARN</span>
            <span>BUILD</span>
            <span>GROW</span>
          </div>
        </section>

        <section className={styles.openings} id="open-roles" aria-labelledby="openings-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>YOUR NEXT CHAPTER</p>
            <h2 id="openings-title">Open positions</h2>
            <p>Find a role where your work can make a difference.</p>
          </div>

          {isLoading && <LoadingIndicator className={styles.loading} label="Loading open positions…" />}
          {error && (
            <div className={styles.stateMessage} role="alert">
              <p>{error}</p>
              <button className={styles.retryButton} onClick={loadJobs} type="button">Try again</button>
            </div>
          )}
          {!isLoading && !error && jobs.length === 0 && (
            <div className={styles.emptyState}>
              <span aria-hidden="true" className={styles.emptyIcon}>✦</span>
              <h3>No open positions right now</h3>
              <p>We don’t have any active openings today. Please check back soon.</p>
            </div>
          )}

          {!isLoading && !error && jobs.length > 0 && (
            <div className={styles.jobList}>
              {jobs.map((job) => {
                const isApplying = applicationJobId === job.id;
                return (
                  <article className={styles.jobCard} key={job.id}>
                    <div className={styles.jobHeader}>
                      <div>
                        <span className={styles.department}>{job.department}</span>
                        <h3>{job.title}</h3>
                        <div className={styles.jobMeta}>
                          <span><span aria-hidden="true">⌖</span> {job.location}</span>
                          <span><span aria-hidden="true">◷</span> {job.employmentType}</span>
                        </div>
                      </div>
                      <button
                        aria-expanded={isApplying}
                        className={styles.applyButton}
                        onClick={() => setApplicationJobId(isApplying ? "" : job.id)}
                        type="button"
                      >
                        {isApplying ? "Close form" : "Apply now"}
                        <span aria-hidden="true">{isApplying ? "×" : "→"}</span>
                      </button>
                    </div>
                    <div className={styles.jobContent}>
                      <h4>About the role</h4>
                      <p className={styles.description}>{job.description}</p>
                      <h4>What we’re looking for</h4>
                      <ul>
                        {job.requirements.split(/\r?\n/).map((requirement, index) =>
                          requirement.trim() ? <li key={`${index}-${requirement}`}>{requirement.trim()}</li> : null,
                        )}
                      </ul>
                    </div>
                    {isApplying && (
                      <JobApplicationForm
                        job={job}
                        onCancel={() => setApplicationJobId("")}
                      />
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
