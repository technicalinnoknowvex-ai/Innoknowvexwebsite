import Link from "next/link";
import footerSection from "../../../data/footer";
import styles from "./Footer.module.css";

function SocialIcon({ platform }) {
  if (platform === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4Z" />
      </svg>
    );
  }

  if (platform === "Instagram") {
    return (
      <svg className={styles.instagramIcon} viewBox="0 0 24 24" aria-hidden="true">
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        />
        <circle cx="17.7" cy="6.5" r="1.25" fill="currentColor" />
      </svg>
    );
  }

  if (platform === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5.2 8.5H2.1V21h3.1V8.5ZM3.7 7.1a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM21.9 13.8c0-3.8-2-5.6-4.7-5.6a4.1 4.1 0 0 0-3.7 2V8.5h-3.1V21h3.1v-6.2c0-1.6.3-3.2 2.3-3.2s2.1 1.9 2.1 3.3V21H21v-7.2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.3 6.2a3 3 0 0 0-2.1-2.1C19.3 3.6 12 3.6 12 3.6s-7.3 0-9.2.5A3 3 0 0 0 .7 6.2 31 31 0 0 0 .2 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.2.5 9.2.5s7.3 0 9.2-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-5.8 31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  );
}

function ContactIcon({ type }) {
  if (type === "location") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.2" />
      </svg>
    );
  }

  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3h3l1.4 4-2 1.5a15 15 0 0 0 6.1 6.1l1.5-2 4 1.4v3c0 1.1-.9 2-2 2A16 16 0 0 1 5 5c0-1.1.9-2 2-2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export default function Footer() {
  const trainingLinks = footerSection.footerLinks.find(
    (group) => group.listLabel === "OUR TRAININGS",
  );
  const generalGroups = footerSection.footerLinks.filter(
    (group) => group.listLabel !== "OUR TRAININGS",
  );

  return (
    <footer id="contact" className={styles.footer} aria-labelledby="footer-title">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.topGrid}>
          <section className={styles.brandColumn}>
            <Link className={styles.brandLink} href="/" aria-label="Innoknowvex home">
              <span className={styles.brandWordmark}>INNOKNOWVEX</span>
              <span className={styles.brandTagline}>LEARN · BUILD · GROW</span>
            </Link>
            <p className={styles.brandMessage}>
              Learn with purpose. Build with confidence. Grow into what’s next.
            </p>
            <div className={styles.socials} aria-label="Social media">
              {footerSection.socialLinks.map((social) => (
                <a
                  aria-label={`Visit Innoknowvex on ${social.label}`}
                  className={styles.socialLink}
                  href={social.href}
                  key={social.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <SocialIcon platform={social.label} />
                </a>
              ))}
            </div>

            <div className={styles.contactBlock}>
              <h2 className={styles.columnTitle} id="footer-title">
                {footerSection.heading}
              </h2>
              <p className={styles.contactEyebrow}>{footerSection.subheading}</p>
              <a className={styles.contactItem} href={`tel:${footerSection.phone.replace(/\s/g, "")}`}>
                <span className={styles.contactIcon}>
                  <ContactIcon type="phone" />
                </span>
                <span>{footerSection.phone}</span>
              </a>
              <a className={styles.contactItem} href={`mailto:${footerSection.email}`}>
                <span className={styles.contactIcon}>
                  <ContactIcon type="email" />
                </span>
                <span>{footerSection.email}</span>
              </a>
              <div className={`${styles.contactItem} ${styles.addressItem}`}>
                <span className={styles.contactIcon}>
                  <ContactIcon type="location" />
                </span>
                <span>
                  {footerSection.address}
                  <small>{footerSection.landmark}</small>
                </span>
              </div>
            </div>
          </section>

          {generalGroups.map((group) => (
            <nav
              aria-label={group.listLabel.toLowerCase()}
              className={styles.linkColumn}
              key={group.listLabel}
            >
              <h2 className={styles.columnTitle}>{group.listLabel}</h2>
              <ul className={styles.linkList}>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {trainingLinks && (
            <nav
              aria-label="Our trainings"
              className={`${styles.linkColumn} ${styles.trainingColumn}`}
            >
              <h2 className={styles.columnTitle}>{trainingLinks.listLabel}</h2>
              <ul className={`${styles.linkList} ${styles.trainingList}`}>
                {trainingLinks.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className={styles.bottomBar}>
          <p>© 2025 Innoknowvex. All rights reserved.</p>
          <span>Learn · Build · Grow</span>
        </div>
      </div>
    </footer>
  );
}
