"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./PopularPrograms.module.css";

const programs = [
  { name: "Web Development", slug: "web-development", icon: "code" },
  { name: "Artificial Intelligence", slug: "artificial-intelligence", icon: "analytics" },
  { name: "Cyber Security", slug: "cyber-security", icon: "shield" },
  { name: "Cloud Computing", slug: "cloud-computing", icon: "cloud" },
  { name: "Digital Marketing", slug: "digital-marketing", icon: "megaphone" },
  { name: "Business Analytics", slug: "business-analytics", icon: "chart" },
];

function ProgramIcon({ type }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "code" && (
        <>
          <path d="m11 9-7 7 7 7M21 9l7 7-7 7M19 6l-6 20" />
        </>
      )}
      {type === "analytics" && (
        <>
          <path d="M5 25h23M8 21v-6h5v6M17 21V9h5v12M24 21V5h4v16" />
          <path d="m8 11 6-4 5 1 7-5" />
        </>
      )}
      {type === "shield" && (
        <>
          <path d="m16 3 11 4v8c0 7-4.7 11.4-11 14-6.3-2.6-11-7-11-14V7l11-4Z" />
          <path d="m11.5 16 3 3 6-7" />
        </>
      )}
      {type === "cloud" && (
        <path d="M9 25h14a6 6 0 0 0 1-11.9A8.5 8.5 0 0 0 7.6 11 7 7 0 0 0 9 25Z" />
      )}
      {type === "megaphone" && (
        <>
          <path d="m4 14 19-8v20L4 18v-4ZM23 12h4a3 3 0 0 1 0 6h-4M8 20l2 7h6l-3-5" />
        </>
      )}
      {type === "chart" && (
        <>
          <path d="M5 26h23M8 22v-7h5v7M17 22V9h5v13M25 22V5h4v17" />
        </>
      )}
    </svg>
  );
}

export default function PopularPrograms() {
  const gridRef = useRef(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHasEnteredView(entry.isIntersecting);
      },
      { threshold: 0.2 },
    );

    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="programs" aria-labelledby="programs-title">
      <div className={styles.inner}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>Popular Programs</p>
            <h2 className={styles.title} id="programs-title">
              Skills for Real-World Opportunities
            </h2>
            <p className={styles.description}>
              Industry-focused programs designed to make you future-ready.
            </p>
          </div>
          <Link className={styles.viewAll} href="/programs">
            View All Programs
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M3.5 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div
          ref={gridRef}
          className={styles.programGrid}
          data-revealed={hasEnteredView}
        >
          {programs.map((program) => (
            <Link
              className={styles.programCard}
              href={`/programs/${program.slug}`}
              key={program.slug}
            >
              <ProgramIcon type={program.icon} />
              <span>{program.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
