"use client";

import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import PartnersSection from "../../components/home/PartnersSection/PartnersSection";
import TestimonialsSection from "../../components/home/TestimonialsSection/TestimonialsSection";
import AboutJourney from "../../components/about/AboutJourney/AboutJourney";
import ScrollReveal from "../../components/about/ScrollReveal/ScrollReveal";
import CollegePartnershipInquiry from "../../components/about/CollegePartnershipInquiry/CollegePartnershipInquiry";
import aboutHeroImage from "../../assets/images/about/aboutus1.png";
import aboutStoryImage from "../../assets/images/about/aboutus2.png";
import aboutCtaImage from "../../assets/images/about/aboutus3.png";
import styles from "./About.module.css";

const impactStats = [
  { value: "50,000+", label: "Learners Trained", icon: "people" },
  { value: "200+", label: "Institutional Partners", icon: "building" },
  { value: "100+", label: "Industry-Relevant Programs", icon: "programs" },
  { value: "95%", label: "Learner Satisfaction", icon: "satisfaction" },
];

const principles = [
  {
    icon: "target",
    title: "Our Mission",
    description:
      "To make industry-ready education, real-world experience and career opportunities accessible to everyone.",
  },
  {
    icon: "vision",
    title: "Our Vision",
    description:
      "To be a global leader in skill development and career technology, empowering millions to achieve their dreams.",
  },
  {
    icon: "values",
    title: "Our Values",
    description:
      "Learner first, innovation, integrity, opportunity for all and real impact.",
  },
];

function PrincipleIcon({ name }) {
  const paths = {
    target: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <path d="m12 12 8-8m-4 0h4v4" />
      </>
    ),
    vision: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    values: (
      <>
        <path d="m12 3 9 5-9 13L3 8l9-5Z" />
        <path d="m3 8 9 2 9-2M12 10v11" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={styles.principleIcon}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function ImpactIcon({ name }) {
  const paths = {
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-1a6 6 0 0 1 12 0v1m1-14a3 3 0 0 1 0 6m2 2a5 5 0 0 1 3 4.6V20" />
      </>
    ),
    building: (
      <>
        <path d="m3 9 9-6 9 6M5 10v9m4-9v9m6-9v9m4-9v9M3 21h18M2 9h20" />
      </>
    ),
    programs: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8m-8 4h8" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18" />
      </>
    ),
    satisfaction: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z" />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={styles.impactIcon}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function AnimatedStatValue({ value }) {
  const valueRef = useRef(null);
  const [count, setCount] = useState(0);
  const target = Number(value.replace(/[^\d]/g, ""));
  const suffix = value.replace(/[\d,]/g, "");

  useEffect(() => {
    const element = valueRef.current;
    if (!element) return undefined;

    let animationFrame;
    let startedAt;

    const startCount = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCount(target);
        return;
      }

      const animate = (timestamp) => {
        if (startedAt === undefined) startedAt = timestamp;
        const progress = Math.min((timestamp - startedAt) / 1400, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        setCount(Math.round(target * easedProgress));

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(animate);
        }
      };

      animationFrame = window.requestAnimationFrame(animate);
    };

    if (!("IntersectionObserver" in window)) {
      startCount();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startCount();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [target]);

  return (
    <strong ref={valueRef} aria-label={value}>
      <span aria-hidden="true">
        {count.toLocaleString("en-US")}
        {suffix}
      </span>
    </strong>
  );
}

export default function About() {
  return (
    <>
      <Head>
        <title>About Innoknowvex | Practical Learning & Career Growth</title>
        <meta
          name="description"
          content="Learn about Innoknowvex and our mission to make industry-ready education, real-world experience, and career opportunities accessible."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Innoknowvex" />
        <meta
          property="og:title"
          content="About Innoknowvex | Practical Learning & Career Growth"
        />
        <meta
          property="og:description"
          content="Learn about Innoknowvex and our mission to make industry-ready education, real-world experience, and career opportunities accessible."
        />
        <link
          rel="canonical"
          href={`${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "")}/about`}
        />
      </Head>
      <Header activeItem="About" />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="about-title">
          <Image
            alt=""
            className={styles.heroImage}
            fill
            priority
            sizes="100vw"
            src={aboutHeroImage}
            unoptimized
          />
          <div className={styles.heroShade} />
          <div className={styles.heroInner}>
            <ScrollReveal className={styles.heroCopy}>
              <p className={styles.eyebrow}>About us</p>
              <h1 id="about-title">
                Empowering People for a <span>Brighter Tomorrow</span>
              </h1>
              <p className={styles.heroDescription}>
                At Innoknowvex, we believe education, technology and opportunity
                can change lives. We are building a future where every learner,
                professional and institution can access industry-ready skills
                and real-world opportunities.
              </p>
              <p className={styles.heroQuote}>
                “A skilled world is a brighter world.”
              </p>
            </ScrollReveal>
            <div className={styles.heroStats} aria-label="Our impact at a glance">
              {impactStats.slice(0, 4).map(({ value, label, icon }, index) => (
                <ScrollReveal
                  as="div"
                  className={styles.heroStat}
                  key={label}
                  style={{ transitionDelay: `${index * 90}ms` }}
                >
                  <ImpactIcon name={icon} />
                  <AnimatedStatValue value={value} />
                  <span>{label}</span>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.content}>
          <section
            className={styles.story}
            id="our-story"
            aria-labelledby="story-title"
          >
            <ScrollReveal as="div" className={styles.storyImageWrap}>
              <Image
                alt="Learners collaborating on a practical project"
                className={styles.storyImage}
                fill
                sizes="(max-width: 760px) 100vw, 45vw"
                src={aboutStoryImage}
                unoptimized
              />
              <span className={styles.imageCaption}>
                Skills. Opportunity. A brighter tomorrow.
              </span>
            </ScrollReveal>
            <ScrollReveal as="div" className={styles.storyCopy}>
              <p className={styles.eyebrow}>Our story</p>
              <h2 id="story-title">From a Vision to a Movement</h2>
              <p>
                Innoknowvex was founded with a simple belief: that the right
                skills and opportunities can transform lives.
              </p>
              <p>
                What started as an education and internship platform has grown
                into a technology-driven ecosystem, connecting students,
                professionals and institutions with real-world learning,
                industry exposure and career opportunities.
              </p>
              <p>
                Today, we are not just an EdTech company — we are a growth
                partner for individuals and institutions, building a skilled
                and future-ready workforce for a better tomorrow.
              </p>
              <Link className={styles.storyButton} href="#our-journey">
                Our Milestones <span aria-hidden="true">→</span>
              </Link>
            </ScrollReveal>
          </section>

          <section className={styles.principles} aria-label="Our mission and values">
            {principles.map((principle, index) => (
              <ScrollReveal
                as="article"
                className={styles.principleCard}
                key={principle.title}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <PrincipleIcon name={principle.icon} />
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </section>

          <AboutJourney />
        </div>

        <section className={styles.cta} aria-labelledby="cta-title">
          <Image
            alt=""
            className={styles.ctaImage}
            fill
            sizes="100vw"
            src={aboutCtaImage}
            unoptimized
          />
          <div className={styles.ctaShade} />
          <ScrollReveal as="div" className={styles.ctaInner}>
            <p className={styles.eyebrow}>Together for a brighter tomorrow</p>
            <h2 id="cta-title">Let’s Build a More Skilled World</h2>
            <p>
              Join hands with Innoknowvex — as a learner, partner or institution
              — and be part of a movement that is creating real opportunities.
            </p>
            <div className={styles.ctaActions}>
              <Link className={styles.primaryButton} href="/#programs">
                Get Started <span aria-hidden="true">→</span>
              </Link>
              <CollegePartnershipInquiry className={styles.secondaryButton} />
            </div>
          </ScrollReveal>
        </section>

        <PartnersSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
