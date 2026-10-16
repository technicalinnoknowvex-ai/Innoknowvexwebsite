"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurriculumForProgram } from "../../data/curriculum";
import { getProjectsForProgram as getCourseProjects } from "../../data/courseProjects";
import CertificateCarousel from "../../components/programs/CertificateCarousel/CertificateCarousel";
import ProgramPricing from "../../components/programs/ProgramPricing/ProgramPricing";
import TestimonialsSection from "../../components/home/TestimonialsSection/TestimonialsSection";
import {
  getProgramToolIconColor,
  getProgramToolIconImage,
  getProgramToolIcons,
} from "../../data/programTools";
import useProgram from "../../hooks/useProgram";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";
import whyInnoknowvexImage from "../../assets/images/programs/whyinoo.png";
import styles from "./ProgramDetails.module.css";

const learnerAvatars = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
];

const courseProjectSlugAliases = {
  "advanced-data-science": "data-science",
  "offline-artificial-intelligence": "artificial-intelligence",
  "offline-data-science": "data-science",
  "offline-machine-learning": "machine-learning",
  "offline-web-development": "advanced-full-stack-web-development",
  "c-and-cpp-programming": "c-and-c-programming",
  "c-cpp-programming": "c-and-c-programming",
  "c-cpp": "c-and-c-programming",
  "web-development": "advanced-full-stack-web-development",
  "full-stack-web-development": "advanced-full-stack-web-development",
  "advanced-web-development": "advanced-full-stack-web-development",
  java: "java-programming",
  "java-dsa": "java-programming",
  dsa: "data-structures-and-algorithms",
  python: "python-programming",
  android: "android-development",
  "clinical-training-research": "clinical-training-and-research",
  "clinical-trials-and-research": "clinical-training-and-research",
  "operations-supply-chain-management": "operations-and-supply-chain-management",
  "supply-chain-management": "operations-and-supply-chain-management",
};

const sharedCourseContentSlugAliases = {
  "offline-artificial-intelligence": "artificial-intelligence",
  "offline-ai": "artificial-intelligence",
  "offline-data-science": "data-science",
  "offline-machine-learning": "machine-learning",
  "offline-ml": "machine-learning",
  "offline-web-development": "web-development",
};

const pricingSlugAliases = {
  "advanced-full-stack-web-development": "advanced-web-development",
  "c-and-cpp-programming": "c-cpp",
  "c-and-c-programming": "c-cpp",
  "clinical-training-and-research": "clinical-trials-and-research",
  "clinical-training-research": "clinical-trials-and-research",
  "data-structures-and-algorithms": "dsa",
  "full-stack-web-development": "advanced-web-development",
  "hybrid-electric-vehicles": "hev",
  "internet-of-things": "iot",
  "java-programming": "java",
  "operations-and-supply-chain-management": "supply-chain-management",
  "web-development": "advanced-web-development",
};

function normalizeProgramSlug(value) {
  let decodedValue = String(value || "");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const decoded = decodeURIComponent(decodedValue);
      if (decoded === decodedValue) break;
      decodedValue = decoded;
    } catch {
      break;
    }
  }

  return decodedValue
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getToolsForProgram(program, routeSlug) {
  const possibleSlugs = [routeSlug, program.slug, program.title, program.name]
    .filter(Boolean)
    .map(normalizeProgramSlug);

  for (const slug of possibleSlugs) {
    const contentSlug = sharedCourseContentSlugAliases[slug] || slug;
    const tools = getProgramToolIcons(contentSlug);
    if (tools.length > 0) return tools;
  }

  return [];
}

const projectImageFallbacks = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=85",
];

function ProjectCard({ index, project }) {
  const fallbackImage = projectImageFallbacks[index % projectImageFallbacks.length];
  const [imageSrc, setImageSrc] = useState(project.image || fallbackImage);

  return (
    <article
      className={styles.projectCard}
      data-scroll-reveal
      style={{ "--reveal-index": index % 5 }}
    >
      <div className={styles.projectImageWrap}>
        <Image
          alt=""
          className={styles.projectImage}
          fill
          loading="lazy"
          onError={() => setImageSrc(fallbackImage)}
          sizes="(max-width: 700px) 50vw, (max-width: 980px) 33vw, 20vw"
          src={imageSrc}
          unoptimized
        />
        <span className={styles.projectImageOverlay} aria-hidden="true" />
        <span className={styles.projectArrow} aria-hidden="true">↗</span>
      </div>
      <div className={styles.projectContent}>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>
    </article>
  );
}

function BenefitIcon({ name, className }) {
  const commonProps = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "duration":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      );
    case "hours":
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="m10 8 5 3-5 3V8ZM8 21h8M12 18v3" />
        </svg>
      );
    case "projects":
      return (
        <svg {...commonProps}>
          <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
        </svg>
      );
    case "certificate":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="9" r="6" />
          <path d="m8.5 14-1 7 4.5-2.5 4.5 2.5-1-7M9.5 9l1.7 1.7L14.5 7.5" />
        </svg>
      );
    case "internship":
      return (
        <svg {...commonProps}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" />
        </svg>
      );
    case "placement":
      return (
        <svg {...commonProps}>
          <path d="M4 19V5M4 19h17M8 15l4-4 3 2 5-6M16 7h4v4" />
        </svg>
      );
    case "sessions":
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="m10 8 5 2.5-5 2.5V8ZM8 21h8M12 17v4" />
        </svg>
      );
    case "mentorship":
      return (
        <svg {...commonProps}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3 20v-1a6 6 0 0 1 12 0v1M15 15a5 5 0 0 1 6 5" />
        </svg>
      );
    default:
      return null;
  }
}

function ProgramLoading() {
  return (
    <main className={styles.statePage} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <p>Loading program details…</p>
    </main>
  );
}

export default function ProgramDetails({ slug }) {
  const routeProgramSlug = normalizeProgramSlug(slug);
  const sharedCourseSlug = sharedCourseContentSlugAliases[routeProgramSlug];
  const programLookupSlug = sharedCourseSlug || routeProgramSlug;
  const { program, isLoading, error, retry } = useProgram(programLookupSlug);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const pageRef = useRef(null);
  const curriculum = useMemo(
    () => {
      if (!program) return [];
      if (sharedCourseSlug) {
        return getCurriculumForProgram({ slug: sharedCourseSlug });
      }
      return getCurriculumForProgram({ slug: program.slug, title: program.title, curriculum: program.curriculum });
    },
    [program, sharedCourseSlug],
  );
  const activeModuleIndex = curriculum[selectedModuleIndex] ? selectedModuleIndex : 0;
  const selectedModule = curriculum[activeModuleIndex];
  useEffect(() => {
    if (
      curriculum.length < 2 ||
      isCarouselPaused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const rotationTimer = window.setTimeout(() => {
      setSelectedModuleIndex((currentIndex) => (currentIndex + 1) % curriculum.length);
    }, 5000);

    return () => window.clearTimeout(rotationTimer);
  }, [activeModuleIndex, curriculum.length, isCarouselPaused]);

  const tools = useMemo(
    () => (program ? getToolsForProgram(program, slug) : []),
    [program, slug],
  );
  const pricingCourseNames = useMemo(() => {
    const possibleNames = [routeProgramSlug, program?.slug, program?.title]
      .filter(Boolean)
      .map(normalizeProgramSlug);
    return [...new Set(possibleNames.flatMap((name) => [name, pricingSlugAliases[name] || name]))];
  }, [program, routeProgramSlug]);
  const projects = useMemo(
    () => {
      if (!program) return [];
      const currentProgramSlug = normalizeProgramSlug(program.slug);
      const contentSlug =
        sharedCourseContentSlugAliases[routeProgramSlug] ||
        sharedCourseContentSlugAliases[currentProgramSlug] ||
        routeProgramSlug ||
        currentProgramSlug;
      const courseSlug = courseProjectSlugAliases[contentSlug] || contentSlug;
      const courseProjects = getCourseProjects(courseSlug);
      return courseProjects.length ? courseProjects : getCourseProjects(program.title);
    },
    [program, routeProgramSlug],
  );

  useEffect(() => {
    if (!program || isLoading) return undefined;

    const revealItems = pageRef.current?.querySelectorAll("[data-scroll-reveal]");
    if (!revealItems?.length) return undefined;

    pageRef.current?.setAttribute("data-scroll-reveal-ready", "true");

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      revealItems.forEach((item) => {
        item.setAttribute("data-revealed", "true");
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.setAttribute(
            "data-revealed",
            entry.isIntersecting ? "true" : "false",
          );
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [program, isLoading]);

  if (isLoading) {
    return (
      <>
        <Header activeItem="Programs" />
        <ProgramLoading />
        <Footer />
      </>
    );
  }

  if (error || !program) {
    const notFound = /not found/i.test(error);
    return (
      <>
        <Header activeItem="Programs" />
        <main className={styles.statePage}>
          <span className={styles.stateEyebrow}>PROGRAM DETAILS</span>
          <h1>{notFound ? "Program not found" : "We couldn’t load this program"}</h1>
          <p>{error || "The requested program could not be found."}</p>
          {notFound ? (
            <Link className={styles.primaryButton} href="/programs">
              Browse all programs
            </Link>
          ) : (
            <button className={styles.primaryButton} onClick={retry} type="button">
              Try again
            </button>
          )}
        </main>
        <Footer />
      </>
    );
  }

  const description =
    program.shortDescription ||
    `Build practical skills in ${program.title} through a structured, industry-focused curriculum. Learn core concepts, put them into practice, and prepare for real-world opportunities.`;
  const bannerImage = program.image_url || program.imageUrl;

  return (
    <>
      <Header activeItem="Programs" />
      <main
        className={styles.programPage}
        ref={pageRef}
      >
        <section className={styles.hero} aria-labelledby="program-title">
          {bannerImage && (
            <Image
              alt=""
              className={styles.heroImage}
              fill
              priority
              sizes="100vw"
              src={bannerImage}
              unoptimized
            />
          )}
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroInner}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">›</span>
              <Link href="/programs">Programs</Link>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{program.title}</span>
            </nav>
            <div className={styles.heroCopy}>
              <span className={styles.programTag}>
                {program.featured ? "POPULAR PROGRAM" : program.category || "PROGRAM"}
              </span>
              <h1 id="program-title">{program.title}</h1>
              <p className={styles.heroDescription}>{description}</p>
              <div className={styles.heroActions}>
                <Link className={styles.primaryButton} href="#pricing-title">
                  Enroll now <span aria-hidden="true">→</span>
                </Link>
                {program.brochureUrl && (
                  <a
                    className={styles.secondaryButton}
                    href={program.brochureUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span aria-hidden="true">↓</span> Download brochure
                  </a>
                )}
              </div>
              <div className={styles.heroProof}>
                <div className={styles.avatarStack} aria-hidden="true">
                  {learnerAvatars.map((avatar) => (
                    <Image
                      className={styles.learnerAvatar}
                      key={avatar}
                      src={avatar}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                    />
                  ))}
                </div>
                <p className={styles.learnerProof}>
                  <strong>50,000+</strong> learners are building their future with us
                </p>
              </div>
            </div>
            <aside className={styles.heroAside} aria-label="Program highlights">
              <p>Program benefits</p>
              <ul>
                <li><span><BenefitIcon className={styles.heroBenefitIcon} name="sessions" /></span> Live interactive sessions</li>
                <li><span><BenefitIcon className={styles.heroBenefitIcon} name="projects" /></span> Hands-on projects</li>
                <li><span><BenefitIcon className={styles.heroBenefitIcon} name="mentorship" /></span> Industry mentorship</li>
                <li><span><BenefitIcon className={styles.heroBenefitIcon} name="internship" /></span> Internship opportunities</li>
                <li><span><BenefitIcon className={styles.heroBenefitIcon} name="certificate" /></span> Globally recognized certificate</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className={styles.facts} aria-label="Program overview">
          <div className={styles.fact}>
            <span className={styles.factIcon} aria-hidden="true"><BenefitIcon className={styles.factSvg} name="duration" /></span>
            <span><strong>6 Months</strong><small>Program duration</small></span>
          </div>
          <div className={styles.fact}>
            <span className={styles.factIcon} aria-hidden="true"><BenefitIcon className={styles.factSvg} name="hours" /></span>
            <span><strong>100+ Hours</strong><small>Live + recorded learning</small></span>
          </div>
          <div className={styles.fact}>
            <span className={styles.factIcon} aria-hidden="true"><BenefitIcon className={styles.factSvg} name="projects" /></span>
            <span><strong>10+ Projects</strong><small>Build real-world applications</small></span>
          </div>
          <div className={styles.fact}>
            <span className={styles.factIcon} aria-hidden="true"><BenefitIcon className={styles.factSvg} name="certificate" /></span>
            <span><strong>Certificate</strong><small>On completion</small></span>
          </div>
          <div className={styles.fact}>
            <span className={styles.factIcon} aria-hidden="true"><BenefitIcon className={styles.factSvg} name="internship" /></span>
            <span><strong>Internship</strong><small>Opportunities</small></span>
          </div>
          <div className={styles.fact}>
            <span className={styles.factIcon} aria-hidden="true"><BenefitIcon className={styles.factSvg} name="placement" /></span>
            <span><strong>Placement Support</strong><small>&amp; career guidance</small></span>
          </div>
        </section>

        <section className={styles.section} id="curriculum" aria-labelledby="curriculum-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>LEARN STEP BY STEP</span>
              <h2 id="curriculum-title">Curriculum overview</h2>
              <p>A structured learning path designed to build your knowledge from the ground up.</p>
            </div>
            {program.brochureUrl && (
              <a className={styles.sectionLink} href={program.brochureUrl} rel="noreferrer" target="_blank">
                View detailed curriculum <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
          <div className={styles.curriculumExplorer}>
            <div className={styles.moduleCarousel}>
              <div
                className={styles.carouselStage}
                role="group"
                aria-label="Curriculum modules carousel"
                onMouseEnter={() => setIsCarouselPaused(true)}
                onMouseLeave={() => setIsCarouselPaused(false)}
                onFocusCapture={() => setIsCarouselPaused(true)}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsCarouselPaused(false);
                  }
                }}
              >
                {curriculum.map((module, index) => {
                  const moduleCount = curriculum.length;
                  let offset = index - activeModuleIndex;

                  if (offset > moduleCount / 2) offset -= moduleCount;
                  if (offset < -moduleCount / 2) offset += moduleCount;

                  const isBackside =
                    moduleCount > 3 &&
                    index === (activeModuleIndex + Math.floor(moduleCount / 2)) % moduleCount;
                  const isVisible = Math.abs(offset) <= 1;
                  const angleStep = Math.max(
                    48,
                    Math.min(56, 360 / Math.max(moduleCount, 1)),
                  );
                  const isActive = activeModuleIndex === index;
                  const isOnStage = isVisible || isBackside;

                  return (
                    <button
                      aria-hidden={!isOnStage}
                      aria-label={`Module ${String(index + 1).padStart(2, "0")}: ${module.title}`}
                      aria-pressed={isActive}
                      className={[
                        styles.moduleCard,
                        isActive ? styles.moduleCardActive : "",
                        isBackside ? styles.moduleCardBackside : "",
                        !isOnStage ? styles.moduleCardHidden : "",
                      ].filter(Boolean).join(" ")}
                      key={`${module.id || module.title}-${index}`}
                      onClick={() => setSelectedModuleIndex(index)}
                      onFocus={() => setSelectedModuleIndex(index)}
                      style={{
                        "--carousel-angle": isBackside
                          ? "180deg"
                          : `${offset * angleStep}deg`,
                        zIndex: isBackside ? 0 : 3 - Math.abs(offset),
                      }}
                      tabIndex={isVisible ? 0 : -1}
                      type="button"
                    >
                      <span className={styles.moduleNumber}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.moduleOptionTitle}>{module.title}</span>
                      <span className={styles.moduleTopicCount}>
                        {(module.topics || []).length} topics
                      </span>
                      <span className={styles.moduleTopicsMobile}>
                        <span className={styles.mobileTopicsLabel}>Topics covered</span>
                        {(module.topics || []).map((topic, topicIndex) => (
                          <span className={styles.mobileTopic} key={`${topic}-${topicIndex}`}>
                            <span aria-hidden="true">✓</span>
                            {topic}
                          </span>
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
              {curriculum.length > 1 && (
                <div className={styles.carouselControls}>
                  <button
                    aria-label="Previous curriculum module"
                    className={styles.carouselArrow}
                    onClick={() =>
                      setSelectedModuleIndex(
                        (activeModuleIndex - 1 + curriculum.length) % curriculum.length,
                      )
                    }
                    type="button"
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <button
                    aria-label="Next curriculum module"
                    className={styles.carouselArrow}
                    onClick={() =>
                      setSelectedModuleIndex((activeModuleIndex + 1) % curriculum.length)
                    }
                    type="button"
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
            </div>
            {selectedModule && (
              <article className={styles.moduleDetail} aria-live="polite" key={selectedModule.id || selectedModule.title}>
                <span className={styles.moduleLabel}>
                  MODULE {String(activeModuleIndex + 1).padStart(2, "0")}
                </span>
                <h3>{selectedModule.title}</h3>
                <div className={styles.moduleTopicsHeading}>
                  <span aria-hidden="true" />
                  <h4>Topics covered</h4>
                </div>
                <ul className={styles.moduleTopics}>
                  {(selectedModule.topics || []).map((topic, index) => (
                    <li key={`${topic}-${index}`}>
                      <span aria-hidden="true">✓</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        </section>

        <section className={`${styles.section} ${styles.projectsSection}`} aria-labelledby="projects-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>BUILD REAL PROJECTS</span>
              <h2 id="projects-title">What You’ll Build</h2>
              <p>Gain practical experience by building projects inspired by real-world work.</p>
            </div>
          </div>
          <div className={styles.projectGrid}>
            {projects.map((project, index) => (
              <ProjectCard
                index={index}
                key={project.id || project.title}
                project={project}
              />
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.skillsSection}`} aria-labelledby="skills-title">
          <div className={styles.sectionHeading} data-scroll-reveal>
            <div>
              <span className={styles.eyebrow}>BUILD REAL-WORLD CONFIDENCE</span>
              <h2 id="skills-title">Skills &amp; tools you’ll use</h2>
            </div>
          </div>
          <div className={styles.technologyViewport}>
            <div className={styles.technologyTrack}>
              {[false, true].map((isDuplicate) => (
                <ul
                  aria-hidden={isDuplicate || undefined}
                  aria-label={isDuplicate ? undefined : "Technologies used in this program"}
                  className={styles.technologyStrip}
                  key={String(isDuplicate)}
                >
                  {tools.map(({ name, icon: ToolIcon }) => {
                    const iconImage = getProgramToolIconImage(name);

                    return (
                      <li className={styles.technologyItem} key={name}>
                        {iconImage ? (
                          <Image
                            alt=""
                            className={styles.technologyIcon}
                            height={44}
                            src={iconImage}
                            unoptimized
                            width={44}
                          />
                        ) : (
                          <ToolIcon
                            aria-hidden="true"
                            className={styles.technologyIcon}
                            style={{ color: getProgramToolIconColor(name) }}
                          />
                        )}
                        <span className={styles.technologyName}>{name}</span>
                      </li>
                    );
                  })}
                </ul>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.whySection}`} aria-labelledby="why-choose-title">
          <div className={styles.whyBanner}>
            <Image
              alt=""
              className={styles.whyBackground}
              fill
              sizes="(max-width: 700px) 100vw, 96vw"
              src={whyInnoknowvexImage}
            />
            <div className={styles.whyOverlay} aria-hidden="true" />
            <div className={styles.whyContent}>
              <span className={styles.whyEyebrow}>WHY CHOOSE INNOKNOWVEX?</span>
              <h2 id="why-choose-title">More Than Just a Course</h2>
              <p>We combine education, experience and opportunity to help you become industry-ready.</p>
            </div>
            <ul className={styles.whyBenefits}>
              {[
                ["sessions", "Live Interactive Classes"],
                ["projects", "Hands-on Projects"],
                ["mentorship", "1:1 Mentorship"],
                ["internship", "Internship Opportunities"],
                ["placement", "Career Support"],
              ].map(([icon, label], index) => (
                <li
                  className={styles.whyBenefit}
                  data-scroll-reveal
                  key={label}
                  style={{ "--reveal-index": index }}
                >
                  <BenefitIcon className={styles.whyBenefitIcon} name={icon} />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <p className={styles.whyCaption} aria-label="Your future starts here">
              <span>Your</span>
              <span>Future</span>
              <span>Starts</span>
              <span>Here</span>
            </p>
          </div>
        </section>

        <CertificateCarousel />

        <ProgramPricing
          courseNames={pricingCourseNames}
          isOffline={routeProgramSlug.startsWith("offline-")}
          programTitle={program.title}
        />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
