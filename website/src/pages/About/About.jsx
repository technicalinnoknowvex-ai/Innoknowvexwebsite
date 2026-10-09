import Image from "next/image";
import Link from "next/link";
import Header from "../../components/layout/Header/Header";
import Footer from "../../components/layout/Footer/Footer";
import PartnersSection from "../../components/home/PartnersSection/PartnersSection";
import AboutJourney from "../../components/about/AboutJourney/AboutJourney";
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

export default function About() {
  return (
    <>
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
          />
          <div className={styles.heroShade} />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
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
            </div>
            <div className={styles.heroStats} aria-label="Our impact at a glance">
              {impactStats.slice(0, 4).map(({ value, label, icon }) => (
                <div className={styles.heroStat} key={label}>
                  <ImpactIcon name={icon} />
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
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
            <div className={styles.storyImageWrap}>
              <Image
                alt="Learners collaborating on a practical project"
                className={styles.storyImage}
                fill
                sizes="(max-width: 760px) 100vw, 45vw"
                src={aboutStoryImage}
              />
              <span className={styles.imageCaption}>
                Skills. Opportunity. A brighter tomorrow.
              </span>
            </div>
            <div className={styles.storyCopy}>
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
            </div>
          </section>

          <section className={styles.principles} aria-label="Our mission and values">
            {principles.map((principle) => (
              <article className={styles.principleCard} key={principle.title}>
                <PrincipleIcon name={principle.icon} />
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </div>
              </article>
            ))}
          </section>

          <section className={styles.impact} aria-labelledby="impact-title">
            <h2 className={styles.eyebrow} id="impact-title">
              Innoknowvex in numbers
            </h2>
            <div className={styles.impactGrid}>
              {impactStats.map(({ value, label, icon }) => (
                <div className={styles.impactItem} key={label}>
                  <ImpactIcon name={icon} />
                  <div>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                </div>
              ))}
            </div>
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
          />
          <div className={styles.ctaShade} />
          <div className={styles.ctaInner}>
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
              <Link className={styles.secondaryButton} href="/#contact">
                Partner With Us
              </Link>
            </div>
          </div>
        </section>

        <PartnersSection />
      </main>
      <Footer />
    </>
  );
}
