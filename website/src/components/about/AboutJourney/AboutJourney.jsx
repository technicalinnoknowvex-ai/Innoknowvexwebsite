"use client";

import { useEffect, useRef, useState } from "react";
import ScrollReveal from "../ScrollReveal/ScrollReveal";
import styles from "./AboutJourney.module.css";

const milestones = [
  { year: "2025", copy: "Innoknowvex began its journey" },
  { year: "2025", copy: "Launched training programs and grew our learning community" },
  { year: "2026", copy: "Launched ORVEXA, our AI initiative" },
  { year: "Beyond", copy: "Building a global skilled community" },
];

export default function AboutJourney() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={styles.journey}
      data-visible={isVisible}
      id="our-journey"
      aria-labelledby="journey-title"
      ref={sectionRef}
    >
      <h2 className={styles.eyebrow} id="journey-title">
        Our journey
      </h2>
      <ol className={styles.timeline}>
        {milestones.map(({ year, copy }, index) => (
          <ScrollReveal
            as="li"
            className={styles.milestone}
            key={`${year}-${copy}`}
            style={{ transitionDelay: `${index * 90}ms` }}
          >
            <span className={styles.milestoneDot} aria-hidden="true" />
            <strong>{year}</strong>
            <span>{copy}</span>
          </ScrollReveal>
        ))}
      </ol>
    </section>
  );
}
