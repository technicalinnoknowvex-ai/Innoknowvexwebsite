"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";
import LoadingIndicator from "../../components/common/LoadingIndicator/LoadingIndicator";
import usePrograms from "../../hooks/usePrograms";
import advancedFullStackWebDevelopment from "../../assets/images/programs/course-image-assets/advanced-full-stack-web-development.jpg";
import androidDevelopment from "../../assets/images/programs/course-image-assets/android-development.png";
import artificialIntelligence from "../../assets/images/programs/course-image-assets/artificial-intelligence.jpg";
import autocad from "../../assets/images/programs/course-image-assets/autocad.jpg";
import businessAnalytics from "../../assets/images/programs/course-image-assets/business-analytics.jpg";
import cAndCppProgramming from "../../assets/images/programs/course-image-assets/c-and-cpp-programming.jpg";
import clinicalTrainingAndResearch from "../../assets/images/programs/course-image-assets/clinical-training-and-research.jpg";
import cloudComputing from "../../assets/images/programs/course-image-assets/cloud-computing.jpg";
import corporateLaw from "../../assets/images/programs/course-image-assets/corporate-law.jpg";
import cyberSecurity from "../../assets/images/programs/course-image-assets/cyber-security.jpg";
import dataScience from "../../assets/images/programs/course-image-assets/data-science.jpg";
import dataStructuresAndAlgorithms from "../../assets/images/programs/course-image-assets/data-structures-and-algorithms.jpg";
import digitalMarketing from "../../assets/images/programs/course-image-assets/digital-marketing.jpg";
import embeddedSystems from "../../assets/images/programs/course-image-assets/embedded-systems.jpg";
import finance from "../../assets/images/programs/course-image-assets/finance.jpg";
import humanResources from "../../assets/images/programs/course-image-assets/human-resources.jpg";
import hybridElectricVehicles from "../../assets/images/programs/course-image-assets/hybrid-electric-vehicles.jpg";
import internetOfThings from "../../assets/images/programs/course-image-assets/internet-of-things.jpg";
import javaProgramming from "../../assets/images/programs/course-image-assets/java-programming.jpg";
import machineLearning from "../../assets/images/programs/course-image-assets/machine-learning.jpg";
import medicalCoding from "../../assets/images/programs/course-image-assets/medical-coding.jpg";
import mernStack from "../../assets/images/programs/course-image-assets/mern-stack.jpg";
import nanotechnology from "../../assets/images/programs/course-image-assets/nanotechnology.jpg";
import offlineArtificialIntelligence from "../../assets/images/programs/course-image-assets/offline-artificial-intelligence.jpg";
import offlineDataScience from "../../assets/images/programs/course-image-assets/offline-data-science.jpg";
import offlineMachineLearning from "../../assets/images/programs/course-image-assets/offline-machine-learning.jpg";
import offlineWebDevelopment from "../../assets/images/programs/course-image-assets/offline-web-development.jpg";
import operationsAndSupplyChainManagement from "../../assets/images/programs/course-image-assets/operations-and-supply-chain-management.jpg";
import psychology from "../../assets/images/programs/course-image-assets/psychology.jpg";
import pythonProgramming from "../../assets/images/programs/course-image-assets/python-programming.jpg";
import stockTrading from "../../assets/images/programs/course-image-assets/stock-trading.jpg";
import uiUxDesign from "../../assets/images/programs/course-image-assets/ui-ux-design.jpg";
import vlsi from "../../assets/images/programs/course-image-assets/vlsi.jpg";
import styles from "./ProgramCatalog.module.css";

const courseImages = {
  "advanced-full-stack-web-development": advancedFullStackWebDevelopment,
  "web-development": advancedFullStackWebDevelopment,
  "full-stack-web-development": advancedFullStackWebDevelopment,
  "android-development": androidDevelopment,
  "artificial-intelligence": artificialIntelligence,
  autocad,
  "business-analytics": businessAnalytics,
  "c-and-cpp-programming": cAndCppProgramming,
  "c-cpp-programming": cAndCppProgramming,
  "c-cpp": cAndCppProgramming,
  "clinical-training-and-research": clinicalTrainingAndResearch,
  "clinical-training-research": clinicalTrainingAndResearch,
  "clinical-trials-and-research": clinicalTrainingAndResearch,
  "cloud-computing": cloudComputing,
  "corporate-law": corporateLaw,
  "cyber-security": cyberSecurity,
  cybersecurity: cyberSecurity,
  "data-science": dataScience,
  "data-structures-and-algorithms": dataStructuresAndAlgorithms,
  "data-structures-algorithms": dataStructuresAndAlgorithms,
  dsa: dataStructuresAndAlgorithms,
  "digital-marketing": digitalMarketing,
  "embedded-systems": embeddedSystems,
  finance,
  "human-resources": humanResources,
  "hybrid-electric-vehicles": hybridElectricVehicles,
  hev: hybridElectricVehicles,
  "internet-of-things": internetOfThings,
  iot: internetOfThings,
  "java-programming": javaProgramming,
  java: javaProgramming,
  "machine-learning": machineLearning,
  "medical-coding": medicalCoding,
  "mern-stack": mernStack,
  nanotechnology,
  "offline-artificial-intelligence": offlineArtificialIntelligence,
  "offline-data-science": offlineDataScience,
  "offline-machine-learning": offlineMachineLearning,
  "offline-web-development": offlineWebDevelopment,
  "operations-and-supply-chain-management": operationsAndSupplyChainManagement,
  "operations-supply-chain-management": operationsAndSupplyChainManagement,
  "supply-chain-management": operationsAndSupplyChainManagement,
  psychology,
  "python-programming": pythonProgramming,
  python: pythonProgramming,
  "stock-trading": stockTrading,
  "ui-ux-design": uiUxDesign,
  "vlsi": vlsi,
};

function normalizeProgramName(value) {
  return value
    ?.trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getCategoryPriority(category) {
  const normalized = category.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  if (normalized.includes("technology")) return 0;
  if (normalized.includes("data") && normalized.includes("ai")) return 1;
  if (normalized.includes("business") && normalized.includes("management")) return 2;
  if (normalized.includes("hardware") && normalized.includes("engineering")) return 3;
  return 4;
}

function ProgramCard({ program, cardImage }) {
  const imageSource = program.imageUrl || cardImage;

  return (
    <Link
      aria-label={`Explore ${program.title}`}
      className={styles.programCard}
      href={`/programs/${encodeURIComponent(program.slug)}`}
    >
      <div className={styles.cardImage}>
        {imageSource ? (
          <Image
            alt={`${program.title} program`}
            className={styles.image}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 960px) 44vw, 30vw"
            src={imageSource}
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
    </Link>
  );
}

export default function ProgramCatalog() {
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
  const programsWithImages = useMemo(
    () =>
      programs.map((program) => ({
        ...program,
        cardImage:
          courseImages[normalizeProgramName(program.slug)] ||
          courseImages[normalizeProgramName(program.title)],
      })),
    [programs],
  );

  const visiblePrograms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return programsWithImages.filter((program) => {
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
  }, [activeCategory, programsWithImages, query]);

  return (
    <>
      <Header activeItem="Programs" />
      <main className={styles.catalogPage}>
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
              <LoadingIndicator
                className={styles.loading}
                label="Loading programs…"
              />
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
                      <ProgramCard
                        key={program.id || program.slug || program.title}
                        program={program}
                        cardImage={program.cardImage}
                      />
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
