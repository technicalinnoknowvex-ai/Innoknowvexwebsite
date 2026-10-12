"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";
import usePrograms from "../../hooks/usePrograms";
import styles from "./Programs.module.css";

function getCategoryPriority(category) {
  const normalized = category.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  if (normalized.includes("technology")) return 0;
  if (normalized.includes("data") && normalized.includes("ai")) return 1;
  if (normalized.includes("business") && normalized.includes("management")) return 2;
  if (normalized.includes("hardware") && normalized.includes("engineering")) return 3;
  return 4;
}

function ProgramCard({ program }) {
  return (
    <article className={styles.programCard}>
      <div className={styles.cardImage}>
        {program.imageUrl ? (
          <Image
            alt=""
            className={styles.image}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 960px) 44vw, 30vw"
            src={program.imageUrl}
            unoptimized
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true">
            <span>IK</span>
          </div>
        )}
        <div className={styles.badges}>
          {program.featured && <span className={styles.featured}>Featured</span>}
          {program.internship && <span className={styles.internship}>Internship</span>}
        </div>
      </div>

      <div className={styles.cardContent}>
        {program.category && (
          <p className={styles.category}>{program.category}</p>
        )}
        <h2 className={styles.cardTitle}>{program.title}</h2>
        {program.shortDescription && (
          <p className={styles.cardDescription}>{program.shortDescription}</p>
        )}
      </div>
    </article>
  );
}

export default function Programs() {
  const { items: programs, isLoading, error, retry } = usePrograms();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All programs");

  const categories = useMemo(() => {
    const availableCategories = [
      ...new Set(
        programs
          .map((program) => program.category?.trim())
          .filter(Boolean),
      ),
    ];
    return availableCategories.sort((first, second) => {
      const priorityDifference =
        getCategoryPriority(first) - getCategoryPriority(second);
      return priorityDifference || first.localeCompare(second);
    });
  }, [programs]);
  const filters = useMemo(() => ["All programs", ...categories], [categories]);

  const visiblePrograms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return programs.filter((program) => {
      const matchesCategory =
        activeCategory === "All programs" ||
        program.category?.trim() === activeCategory;
      const searchableText = [
        program.title,
        program.category,
        program.shortDescription,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchableText.includes(normalizedQuery);
    });
  }, [activeCategory, programs, query]);

  return (
    <>
      <Header activeItem="Programs" />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="programs-title">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>Learn · Build · Grow</p>
            <h1 id="programs-title">
              Find the program that moves <span>you forward.</span>
            </h1>
            <p className={styles.heroDescription}>
              Explore practical, industry-focused programs designed to help you
              build real skills and prepare for what comes next.
            </p>
            {!isLoading && !error && (
              <p className={styles.programCount}>
                {programs.length} {programs.length === 1 ? "program" : "programs"} to explore
              </p>
            )}
          </div>
        </section>

        <section className={styles.catalog} aria-labelledby="catalog-title">
          <div className={styles.catalogInner}>
            <div className={styles.catalogHeading}>
              <div>
                <p className={styles.sectionEyebrow}>Explore your possibilities</p>
                <h2 id="catalog-title">Our Programs</h2>
              </div>
              <label className={styles.search}>
                <span className={styles.searchIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 4.5 4.5" />
                  </svg>
                </span>
                <span className={styles.visuallyHidden}>Search programs</span>
                <input
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search programs"
                  type="search"
                  value={query}
                />
              </label>
            </div>

            {!isLoading && !error && filters.length > 1 && (
              <div className={styles.filters} aria-label="Filter by category">
                {filters.map((category) => (
                  <button
                    aria-pressed={activeCategory === category}
                    className={
                      activeCategory === category
                        ? `${styles.filter} ${styles.activeFilter}`
                        : styles.filter
                    }
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    type="button"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div
                aria-label="Loading programs"
                className={styles.programGrid}
                role="status"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <div className={styles.skeletonCard} key={index}>
                    <span className={styles.skeletonImage} />
                    <span className={styles.skeletonLine} />
                    <span className={styles.skeletonLineShort} />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className={styles.message} role="alert">
                <p>We couldn’t load the programs. {error}</p>
                <button className={styles.retryButton} onClick={retry} type="button">
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !error && programs.length === 0 && (
              <p className={styles.message}>
                Programs will appear here as soon as they are available.
              </p>
            )}

            {!isLoading && !error && programs.length > 0 && (
              <>
                {visiblePrograms.length > 0 ? (
                  <div className={styles.programGrid}>
                    {visiblePrograms.map((program) => (
                      <ProgramCard key={program.id || program.slug || program.title} program={program} />
                    ))}
                  </div>
                ) : (
                  <p className={styles.message}>
                    No programs match your search. Try another title or category.
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
