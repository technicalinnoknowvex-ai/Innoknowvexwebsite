"use client";

import Image from "next/image";
import usePartners from "../../../hooks/usePartners";
import styles from "./PartnersSection.module.css";

function PartnerLogo({ partner }) {
  if (!partner.logo) {
    return <span className={styles.logoName}>{partner.name}</span>;
  }

  return (
    <Image
      className={styles.logoImage}
      src={partner.logo}
      alt={partner.name}
      width={190}
      height={72}
      unoptimized
    />
  );
}

function PartnerGroup({ partners, hidden = false }) {
  return (
    <ul className={styles.logoGroup} aria-hidden={hidden || undefined}>
      {partners.map((partner) => (
        <li className={styles.logoCard} key={partner.id}>
          <PartnerLogo partner={partner} />
        </li>
      ))}
    </ul>
  );
}

export default function PartnersSection() {
  const { items: partners, isLoading, error, retry } = usePartners();

  return (
    <section className={styles.section} aria-labelledby="partners-title">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Our Partners</p>
          <h2 className={styles.title} id="partners-title">
            Growing Together
          </h2>
        </div>

        {isLoading && (
          <div
            className={styles.loading}
            aria-label="Loading partners"
            role="status"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <span className={styles.loadingLogo} key={index} />
            ))}
          </div>
        )}

        {error && (
          <div className={styles.message} role="alert">
            <span>Partners could not be loaded: {error}</span>
            <button className={styles.retry} onClick={retry} type="button">
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && partners.length === 0 && (
          <p className={styles.message}>Partner logos will be shown here soon.</p>
        )}

        {!isLoading && !error && partners.length > 0 && (
          <div
            className={styles.marquee}
            aria-label="Innoknowvex partners"
            role="region"
          >
            <div className={styles.track}>
              <PartnerGroup partners={partners} />
              <PartnerGroup partners={partners} hidden />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
