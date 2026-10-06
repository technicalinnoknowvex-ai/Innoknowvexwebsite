"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import usePartners from "../../../hooks/usePartners";
import styles from "./PartnersSection.module.css";

const partnerCategories = [
  {
    id: "brand",
    label: "Ecosystem Partners",
    description:
      "Organizations, institutions, and technology partners working with us to strengthen the learning ecosystem.",
    centerTitle: "INNOKNOWVEX",
    centerCaption: "Learning ecosystem",
  },
  {
    id: "hiring_partner",
    label: "Hiring Partners",
    description:
      "Our industry connections help learners turn practical skills into meaningful career opportunities.",
    centerTitle: "CAREER",
    centerCaption: "Skills · Industry · Opportunity",
  },
];

function getCategory(type) {
  const normalized =
    typeof type === "string"
      ? type.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
      : "";
  return [
    "hiring",
    "hiring_partner",
    "hiring_partners",
    "hiringpartner",
    "hiringpartners",
  ].includes(normalized)
    ? "hiring_partner"
    : "brand";
}

function PartnerNode({ partner, index, category, position }) {
  return (
    <div
      aria-label={`${partner.name}${category === "hiring_partner" ? ", hiring partner" : ", ecosystem partner"}`}
      className={styles.partnerNode}
      role="img"
      style={{ ...position, "--node-index": index }}
      tabIndex={0}
      title={partner.name}
    >
      <span className={styles.partnerLogo}>
        {partner.logo ? (
          <Image
            alt=""
            className={styles.logoImage}
            src={partner.logo}
            width={160}
            height={64}
            unoptimized
          />
        ) : (
          <span className={styles.logoName}>{partner.name}</span>
        )}
      </span>
      <span className={styles.partnerTooltip} aria-hidden="true">
        {partner.name}
      </span>
    </div>
  );
}

function PartnerVisualization({ partners, category, activeCategory }) {
  const ringSizes = [
    { width: "82%", height: "88%" },
    { width: "74%", height: "80%" },
  ];
  const nodes = partners.map((partner, index) => {
    const ringIndex = index % 2;
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / partners.length;
    const radiusX = ringIndex === 0 ? 39 : 36;
    const radiusY = ringIndex === 0 ? 44 : 40;

    return {
      id: partner.id,
      x: 50 + Math.cos(angle) * radiusX,
      y: 50 + Math.sin(angle) * radiusY,
    };
  });

  return (
    <div
      aria-label={`${activeCategory.label} network`}
      className={styles.visualization}
      data-category={category}
      key={category}
      role="group"
    >
      <svg
        className={styles.connections}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {category === "hiring_partner" && (
          <>
            <path className={styles.flowPath} d="M 4 22 C 27 20, 34 38, 50 50 C 66 62, 73 80, 96 78" />
            <path className={styles.flowPath} d="M 4 50 C 27 50, 35 50, 50 50 C 65 50, 73 50, 96 50" />
            <path className={styles.flowPath} d="M 4 78 C 27 80, 34 62, 50 50 C 66 38, 73 20, 96 22" />
          </>
        )}
        {category === "brand" &&
          nodes.map(
            (node, index) =>
              index % 2 === 0 && (
                <line
                  key={node.id}
                  x1="50"
                  y1="50"
                  x2={node.x}
                  y2={node.y}
                  pathLength="1"
                  style={{ "--node-index": index }}
                />
              ),
          )}
      </svg>

      {ringSizes.map((size, index) => (
        <span
          aria-hidden="true"
          className={styles.orbit}
          key={size.width}
          style={{
            "--orbit-width": size.width,
            "--orbit-height": size.height,
            "--orbit-delay": `${index * -2.2}s`,
          }}
        />
      ))}

      <div className={styles.nodes}>
        {partners.map((partner, index) => (
          <PartnerNode
            category={category}
            index={index}
            key={partner.id}
            partner={partner}
            position={{ left: `${nodes[index].x}%`, top: `${nodes[index].y}%` }}
          />
        ))}
      </div>

      <div className={styles.center} aria-label={activeCategory.centerTitle}>
        <span className={styles.centerRing} aria-hidden="true" />
        <span className={styles.centerMark}>
          {category === "hiring_partner" ? (
            <span className={styles.careerArrow} aria-hidden="true">
              ↗
            </span>
          ) : (
            <span className={styles.centerMonogram} aria-hidden="true">
              I
            </span>
          )}
          <strong>{activeCategory.centerTitle}</strong>
          <small>{activeCategory.centerCaption}</small>
        </span>
      </div>
    </div>
  );
}

export default function PartnersSection() {
  const { items: partners, isLoading, error, retry } = usePartners();
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const categorizedPartners = useMemo(() => {
    const result = { brand: [], hiring_partner: [] };
    partners.forEach((partner) => {
      result[getCategory(partner.type)].push(partner);
    });
    return result;
  }, [partners]);

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

  return (
    <section
      className={styles.section}
      aria-labelledby="partners-title"
      data-visible={isVisible}
      ref={sectionRef}
    >
      <div className={styles.inner}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Our Ecosystem</p>
          <h2 className={styles.title} id="partners-title">
            Learning Meets Opportunity
          </h2>
          <p className={styles.intro}>
            We collaborate with leading organizations, institutions, and hiring
            partners to create meaningful learning and career opportunities for
            our students.
          </p>
        </header>

        {isLoading && (
          <div className={styles.loading} aria-label="Loading partners" role="status">
            <span className={styles.loadingLogo} />
            <span className={styles.loadingLogo} />
            <span className={styles.loadingLogo} />
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

        {!isLoading && !error && (
          <div className={styles.networkGrid}>
            {partnerCategories.map((category, index) => {
              const categoryPartners = categorizedPartners[category.id];

              return (
                <article
                  aria-labelledby={`partner-heading-${category.id}`}
                  className={styles.panel}
                  key={category.id}
                  style={{ "--panel-index": index }}
                >
                  <div className={styles.panelHeading}>
                    <h3 id={`partner-heading-${category.id}`}>
                      {category.label}
                    </h3>
                    <p>{category.description}</p>
                  </div>

                  {categoryPartners.length ? (
                    <PartnerVisualization
                      activeCategory={category}
                      category={category.id}
                      partners={categoryPartners}
                    />
                  ) : (
                    <p className={styles.message}>
                      {category.label} will be shown here soon.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
