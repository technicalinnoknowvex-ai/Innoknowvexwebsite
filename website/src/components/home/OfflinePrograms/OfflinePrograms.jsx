"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import programData from "../../../data/offlinePrograms";
import styles from "./OfflinePrograms.module.css";

export default function OfflinePrograms() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("next");
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const activeProgram = programData.programs[activeIndex];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (!("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.12 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused || programData.programs.length < 2) return undefined;

    const timer = window.setTimeout(() => {
      const nextIndex = (activeIndex + 1) % programData.programs.length;
      setDirection(nextIndex > activeIndex ? "next" : "previous");
      setActiveIndex(nextIndex);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, isVisible]);

  function selectProgram(index) {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? "next" : "previous");
    setActiveIndex(index);
  }

  return (
    <section
      className={styles.section}
      id="offline-programs"
      aria-labelledby="offline-programs-title"
      ref={sectionRef}
      data-visible={isVisible}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className={styles.inner}>
        <header className={styles.heading}>
          <span className={styles.eyebrow}>{programData.heading}</span>
          <h2 className={styles.title} id="offline-programs-title">
            {programData.subHeading}
          </h2>
          <p className={styles.description}>{programData.description}</p>
        </header>

        <nav className={styles.journeyNav} aria-label="Offline career journey">
          <div className={styles.path} aria-hidden="true">
            <span
              className={styles.pathProgress}
              style={{
                width: `${(activeIndex / (programData.programs.length - 1)) * 100}%`,
              }}
            />
          </div>
          {programData.programs.map((program, index) => (
            <button
              aria-current={index === activeIndex ? "step" : undefined}
              aria-label={`Stage ${program.number}: ${program.title}`}
              className={styles.stageButton}
              key={program.slug}
              onClick={() => selectProgram(index)}
              type="button"
            >
              <span className={styles.stageNumber}>{program.number}</span>
              <span className={styles.stageName}>{program.title}</span>
            </button>
          ))}
        </nav>

        <div
          className={styles.experience}
          data-direction={direction}
          key={activeProgram.slug}
        >
          <div className={styles.visual}>
            <div className={styles.imageFrame}>
              <Image
                alt={`${activeProgram.title} offline program`}
                className={styles.courseImage}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 760px) 90vw, 42vw"
                src={activeProgram.image}
                unoptimized
              />
              <div className={styles.imageShade} aria-hidden="true" />
              <span className={styles.imageLabel}>
                <span className={styles.liveDot} />
                Classroom to career
              </span>
              <span className={styles.imageNumber} aria-hidden="true">
                {activeProgram.number}
              </span>
            </div>

            <div className={styles.roleCluster} aria-label="Career opportunities">
              {activeProgram.careerRoles.map((role, index) => (
                <span
                  className={styles.roleChip}
                  key={role}
                  style={{ "--chip-index": index }}
                >
                  <span aria-hidden="true">↗</span>
                  {role}
                </span>
              ))}
            </div>
          </div>

          <article className={styles.details} aria-live="polite">
            <p className={styles.courseKicker}>
              <span>{activeProgram.number}</span>
              <span className={styles.kickerLine} aria-hidden="true" />
              <span className={styles.journeyPhrase}>
                <span>Learn</span>
                <span aria-hidden="true">→</span>
                <span>Build</span>
                <span aria-hidden="true">→</span>
                <span>Practice</span>
                <span aria-hidden="true">→</span>
                <span>Career ready</span>
              </span>
            </p>
            <h3 className={styles.courseTitle}>{activeProgram.title}</h3>
            <p className={styles.courseDescription}>
              {activeProgram.description}
            </p>

            <div className={styles.learningBlock}>
              <h4 className={styles.subheading}>The learning experience</h4>
              <ul className={styles.benefits}>
                {activeProgram.benefits.map((benefit) => (
                  <li key={benefit}>
                    <span className={styles.check} aria-hidden="true">
                      ✓
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.highlightsBlock}>
              <h4 className={styles.subheading}>You’ll explore</h4>
              <div className={styles.highlights}>
                {activeProgram.highlights.map((highlight) => (
                  <span className={styles.highlight} key={highlight}>
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            <Link
              className={styles.exploreButton}
              href={`/programs/${activeProgram.slug}`}
            >
              Explore this program <span aria-hidden="true">→</span>
            </Link>
          </article>
        </div>

      </div>
    </section>
  );
}
