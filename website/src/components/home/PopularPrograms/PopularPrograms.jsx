"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
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
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let inView = true;
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const update = () => {
      frame = 0;
      const rect = grid.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress = clamp((viewport * 0.96 - rect.top) / (viewport * 0.6));
      Array.from(grid.children).forEach((card, index) => {
        const p = media.matches ? 1 : clamp((progress - index * 0.045) / 0.72);
        const eased = 1 - Math.pow(1 - p, 3);
        const side = index % 2 === 0 ? -1 : 1;
        card.style.setProperty("--reveal-y", String(60 * (1 - eased)) + "px");
        card.style.setProperty("--reveal-rx", String(28 * (1 - eased)) + "deg");
        card.style.setProperty("--reveal-ry", String(side * 32 * (1 - eased)) + "deg");
        card.style.setProperty("--reveal-z", String(-150 * (1 - eased)) + "px");
        card.style.setProperty("--reveal-opacity", 0.35 + eased * 0.65);
      });
    };
    const schedule = () => {
      if (inView && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) schedule();
    }, { rootMargin: "150px" });
    observer.observe(grid);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
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

        <div ref={gridRef} className={styles.programGrid}>
          {programs.map((program, index) => (
            <Link
              className={styles.programCard}
              href={`/programs/${program.slug}`}
              key={program.slug}
            >
              <span className={styles.cardTop}><span className={styles.cardNumber}>0{index + 1}</span><span className={styles.cardArrow} aria-hidden="true">↗</span></span>
              <span className={styles.iconPlate}><ProgramIcon type={program.icon} /></span>
              <span className={styles.cardName}>{program.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
