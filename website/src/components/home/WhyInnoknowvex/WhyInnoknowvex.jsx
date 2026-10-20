"use client";

import Image from "next/image";
import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import backgroundImage from "../../../assets/images/hero/whyinnoknowvex.png";
import styles from "./WhyInnoknowvex.module.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

const benefits = [
  { title: "Practical Learning", icon: "learning" },
  { title: "Internships & Projects", icon: "internship" },
  { title: "Industry Mentorship", icon: "mentorship" },
  { title: "Career Opportunities", icon: "career" },
];

function BenefitIcon({ type }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "learning" && (
        <>
          <path d="m3 11 13-7 13 7-13 7-13-7Z" />
          <path d="M8 14v7c4.5 4 11.5 4 16 0v-7M29 11v9" />
        </>
      )}
      {type === "internship" && (
        <>
          <rect x="4" y="10" width="24" height="17" rx="2" />
          <path d="M11 10V6h10v4M4 16h24M13 16v3h6v-3" />
        </>
      )}
      {type === "mentorship" && (
        <>
          <circle cx="12" cy="10" r="4" />
          <circle cx="23" cy="12" r="3" />
          <path d="M3 26v-2a9 9 0 0 1 18 0v2M21 19a7 7 0 0 1 8 7" />
        </>
      )}
      {type === "career" && (
        <>
          <path d="M5 27h23M8 23v-7h5v7M17 23V9h5v14M25 23V5h4v18" />
        </>
      )}
    </svg>
  );
}

export default function WhyInnoknowvex() {
  const bannerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return undefined;

    if (!("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(banner);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} aria-labelledby="why-title">
      <div
        ref={bannerRef}
        className={styles.banner}
        data-revealed={isVisible}
      >
        <Image
          className={styles.background}
          src={backgroundImage}
          alt=""
          fill
          sizes="(max-width: 700px) 100vw, 96vw"
          unoptimized
        />
        <div className={styles.overlay} aria-hidden="true" />

        <div className={styles.content}>
          <p className={styles.eyebrow}>Why Innoknowvex</p>
          <h2 className={styles.title} id="why-title">
            More Than
            <br />
            Just Learning
          </h2>
          <p className={styles.description}>
            We combine education, experience and technology to help you achieve
            real career growth.
          </p>
          <Link className={styles.impactLink} href="/About/About">
            Our Impact <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul className={styles.benefits}>
          {benefits.map((benefit) => (
            <li className={styles.benefit} key={benefit.title}>
              <BenefitIcon type={benefit.icon} />
              <span>{benefit.title}</span>
            </li>
          ))}
        </ul>

        <p className={`${styles.caption} ${dancingScript.className}`}>
          <span>Dream</span>
          <span>Learn</span>
          <span>Build</span>
          <span>Grow</span>
        </p>
      </div>
    </section>
  );
}
