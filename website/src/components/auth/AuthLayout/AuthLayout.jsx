import Link from "next/link";
import Image from "next/image";
import styles from "./AuthLayout.module.css";
import signinBackground from "../../../assets/images/hero/signin.png";
import brandLogo from "../../../assets/images/hero/logo.png";

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
      <aside
        className={styles.visual}
      >
        <Image
          src={signinBackground}
          alt=""
          fill
          priority
          sizes="(max-width: 860px) 100vw, 55vw"
          className={styles.visualImage}
        />
        <Link href="/" className={styles.visualBrand} aria-label="Innoknowvex home">
          <Image
            src={brandLogo}
            alt="INNOKNOWVEX"
            width={180}
            height={44}
            priority
            className={styles.brandImage}
          />
        </Link>
      </aside>

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

        <p className={styles.legal}>© 2026 INNOKNOWVEX</p>
      </section>
    </main>
  );
}
