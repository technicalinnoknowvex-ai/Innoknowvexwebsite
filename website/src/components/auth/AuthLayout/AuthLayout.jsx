import Link from "next/link";
import styles from "./AuthLayout.module.css";

export default function AuthLayout({
  eyebrow,
  title,
  description,
  alternateHref,
  alternatePrompt,
  alternateLabel,
  children,
}) {
  return (
    <main className={styles.page}>
      <section className={styles.formPanel}>
        <div className={styles.topLink}>
          <span>{alternatePrompt}</span>
          <Link href={alternateHref}>{alternateLabel}</Link>
        </div>

        <div className={styles.formContent}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2>{title}</h2>
          <p className={styles.description}>{description}</p>
          {children}
        </div>

        <p className={styles.legal}>© 2025 INNOKNOWVEX. All rights reserved.</p>
      </section>
    </main>
  );
}
