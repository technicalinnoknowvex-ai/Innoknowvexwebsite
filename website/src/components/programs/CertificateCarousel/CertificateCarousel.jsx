"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import internshipCertificate from "../../../assets/images/programs/Internship_certificate.jpeg";
import trainingCertificate from "../../../assets/images/programs/Training_certificate.jpeg";
import styles from "./CertificateCarousel.module.css";

const certificates = [
  {
    title: "Training Certificate",
    image: trainingCertificate,
  },
  {
    title: "Internship Certificate",
    image: internshipCertificate,
  },
];

export default function CertificateCarousel() {
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!selectedCertificate) return undefined;

    const previouslyFocusedElement = document.activeElement;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedCertificate(null);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
      previouslyFocusedElement?.focus?.();
    };
  }, [selectedCertificate]);

  return (
    <section className={styles.section} aria-labelledby="certificates-title">
      <div className={styles.heading} data-scroll-reveal>
        <span className={styles.eyebrow}>RECOGNIZE EVERY MILESTONE</span>
        <h2 id="certificates-title">Your learning, recognized</h2>
        <p>Click a certificate to view the sample in a larger size.</p>
      </div>
      <div className={styles.certificateGrid}>
        {certificates.map((certificate, index) => (
          <button
            aria-label={`View ${certificate.title} sample larger`}
            className={styles.certificateCard}
            data-scroll-reveal
            key={certificate.title}
            onClick={() => setSelectedCertificate(certificate)}
            style={{ "--reveal-index": index + 1 }}
            type="button"
          >
            <span className={styles.previewFrame}>
              <Image
                alt=""
                className={styles.certificateImage}
                fill
                sizes="(max-width: 700px) 90vw, 560px"
                src={certificate.image}
                unoptimized
              />
              <span className={styles.zoomHint} aria-hidden="true">Click to enlarge ↗</span>
            </span>
            <span className={styles.certificateTitle}>{certificate.title}</span>
          </button>
        ))}
      </div>
      {selectedCertificate && (
        <div
          className={styles.lightbox}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedCertificate(null);
          }}
        >
          <div
            aria-labelledby="certificate-lightbox-title"
            aria-modal="true"
            className={styles.lightboxDialog}
            role="dialog"
          >
            <div className={styles.lightboxHeader}>
              <h3 id="certificate-lightbox-title">{selectedCertificate.title}</h3>
              <button
                aria-label="Close enlarged certificate"
                className={styles.closeButton}
                onClick={() => setSelectedCertificate(null)}
                ref={closeButtonRef}
                type="button"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className={styles.enlargedPreview}>
              <Image
                alt={`Sample ${selectedCertificate.title}`}
                className={styles.enlargedImage}
                fill
                sizes="95vw"
                src={selectedCertificate.image}
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
