"use client";

import styles from "./StudentGuidancePopup.module.css";

export default function StudentGuidanceContactButton() {
  return (
    <button
      aria-haspopup="dialog"
      className={styles.contactButton}
      onClick={() => window.dispatchEvent(new Event("open-student-guidance"))}
      type="button"
    >
      <span>Talk to a counselor</span>
      <span aria-hidden="true">→</span>
    </button>
  );
}
