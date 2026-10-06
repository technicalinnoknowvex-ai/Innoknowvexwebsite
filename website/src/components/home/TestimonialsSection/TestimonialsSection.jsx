"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import useTestimonials from "../../../hooks/useTestimonials";
import styles from "./TestimonialsSection.module.css";

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StudentPortrait({ testimonial, className, decorative = false }) {
  const [hasImageError, setHasImageError] = useState(false);
  const initials = getInitials(testimonial.name);

  if (!testimonial.profileImage || hasImageError) {
    return (
      <div
        className={`${styles.portraitFallback} ${className}`}
        aria-hidden={decorative || undefined}
      >
        {!decorative && (
          <>
            <span className={styles.fallbackInitials}>{initials}</span>
            <span className={styles.fallbackLabel}>Learner story</span>
          </>
        )}
      </div>
    );
  }

  return (
    <Image
      className={className}
      src={testimonial.profileImage}
      alt={decorative ? "" : `Portrait of ${testimonial.name}`}
      fill
      sizes="(max-width: 700px) 88vw, 42vw"
      unoptimized
      aria-hidden={decorative || undefined}
      onError={() => setHasImageError(true)}
    />
  );
}

function quoteLines(content) {
  const allWords = content.trim().split(/\s+/);
  const words = allWords.slice(0, 40);
  const lines = [];

  for (let index = 0; index < words.length; index += 8) {
    const line = words.slice(index, index + 8).join(" ");
    lines.push(
      index + 8 >= words.length && allWords.length > words.length
        ? `${line.replace(/[.!?…]+$/, "")}…`
        : line,
    );
  }

  return lines;
}

function JourneyStory({
  testimonial,
  previous,
  next,
  direction,
  isVisible,
  isExiting,
  onPortraitEnter,
  onPortraitLeave,
}) {
  const rating = Number(testimonial.rating);
  const hasRating = Number.isFinite(rating) && rating >= 1 && rating <= 5;
  const program = [testimonial.designation, testimonial.program]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={styles.experience}
      data-direction={direction}
      data-visible={isVisible}
      data-exiting={isExiting}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={styles.portraitStack}
        onMouseEnter={onPortraitEnter}
        onMouseLeave={onPortraitLeave}
      >
        {previous && (
          <div
            className={`${styles.portraitBack} ${styles.portraitPrevious}`}
            aria-hidden="true"
          >
            <StudentPortrait
              testimonial={previous}
              className={styles.backImage}
              decorative
            />
          </div>
        )}
        {next && (
          <div
            className={`${styles.portraitBack} ${styles.portraitNext}`}
            aria-hidden="true"
          >
            <StudentPortrait
              testimonial={next}
              className={styles.backImage}
              decorative
            />
          </div>
        )}
        <div className={styles.portraitFrame} key={testimonial.id}>
          <StudentPortrait
            testimonial={testimonial}
            className={styles.portrait}
          />
          <span className={styles.imageCaption}>A learner’s journey</span>
        </div>
        <span className={styles.photoAccent} />
      </div>

      <article className={styles.story} key={`story-${testimonial.id}`}>
        <span className={styles.openingQuote} aria-hidden="true">
          “
        </span>
        <div className={styles.quote} aria-label={testimonial.content}>
          {quoteLines(testimonial.content).map((line, index) => (
            <span className={styles.quoteLine} key={`${index}-${line}`}>
              {line}
            </span>
          ))}
        </div>

        <div className={styles.studentDetails}>
          <h3 className={styles.studentName}>{testimonial.name}</h3>
          {program && <p className={styles.program}>{program}</p>}
        </div>

        {(hasRating || testimonial.featured) && (
          <div className={styles.badges}>
            {hasRating && (
              <span className={styles.rating}>
                <span aria-hidden="true">★</span>
                <span>{rating.toFixed(1)} / 5 learner rating</span>
              </span>
            )}
            {testimonial.featured && (
              <span className={styles.featured}>Featured story</span>
            )}
          </div>
        )}
      </article>
    </div>
  );
}

export default function TestimonialsSection() {
  const sectionRef = useRef(null);
  const transitionTimer = useRef(null);
  const { items: testimonials, isLoading, error, retry } = useTestimonials();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("next");
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    if (!("IntersectionObserver" in window)) {
      const fallbackFrame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(fallbackFrame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }
    },
    [],
  );

  const currentIndex = testimonials.length ? activeIndex % testimonials.length : 0;

  const moveTo = useCallback((index, nextDirection) => {
    if (isTransitioning || testimonials.length < 2) return;

    const nextIndex = (index + testimonials.length) % testimonials.length;
    if (nextIndex === currentIndex) return;

    setDirection(nextDirection);
    setIsTransitioning(true);
    transitionTimer.current = window.setTimeout(() => {
      setActiveIndex(nextIndex);
      setIsTransitioning(false);
      transitionTimer.current = null;
    }, 300);
  }, [currentIndex, isTransitioning, testimonials.length]);

  useEffect(() => {
    if (
      !isVisible ||
      isPaused ||
      isTransitioning ||
      isLoading ||
      error ||
      testimonials.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      moveTo(currentIndex + 1, "next");
    }, 2700);

    return () => window.clearTimeout(timer);
  }, [
    activeIndex,
    currentIndex,
    error,
    isLoading,
    isPaused,
    isTransitioning,
    isVisible,
    moveTo,
    testimonials.length,
  ]);

  const activeTestimonial = testimonials[currentIndex];
  const previousTestimonial =
    testimonials.length > 1
      ? testimonials[(currentIndex - 1 + testimonials.length) % testimonials.length]
      : null;
  const nextTestimonial =
    testimonials.length > 1
      ? testimonials[(currentIndex + 1) % testimonials.length]
      : null;

  return (
    <section
      className={styles.section}
      id="testimonials"
      aria-labelledby="testimonials-title"
      ref={sectionRef}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className={styles.inner}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Student Journey</p>
          <h2 className={styles.title} id="testimonials-title">
            What Our Learners Say
          </h2>
          <p className={styles.description}>
            Hear directly from learners who have experienced our programs and
            learning journey.
          </p>
        </div>

        {isLoading && (
          <div className={styles.loading} role="status">
            <span className={styles.loadingPortrait} />
            <span className={styles.loadingStory} />
            <span className={styles.loadingLabel}>Loading learner stories…</span>
          </div>
        )}

        {error && (
          <div className={styles.message} role="alert">
            <span>Testimonials could not be loaded: {error}</span>
            <button className={styles.retry} onClick={retry} type="button">
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && testimonials.length === 0 && (
          <p className={styles.message}>
            Learner stories will be shared here soon.
          </p>
        )}

        {!isLoading && !error && activeTestimonial && (
          <>
            <JourneyStory
              key={activeTestimonial.id}
              testimonial={activeTestimonial}
              previous={previousTestimonial}
              next={nextTestimonial}
              direction={direction}
              isVisible={isVisible}
              isExiting={isTransitioning}
              onPortraitEnter={() => setIsPaused(true)}
              onPortraitLeave={() => setIsPaused(false)}
            />

            {testimonials.length > 1 && (
              <div className={styles.navigation}>
                <button
                  aria-label="Previous learner story"
                  className={styles.navButton}
                  disabled={isTransitioning}
                  onClick={() => moveTo(currentIndex - 1, "previous")}
                  type="button"
                >
                  <span aria-hidden="true">←</span>
                  <span className={styles.navLabel}>Previous story</span>
                </button>

                <div className={styles.progress}>
                  <span className={styles.counter}>
                    {String(currentIndex + 1).padStart(2, "0")}
                    <span aria-hidden="true"> / </span>
                    {String(testimonials.length).padStart(2, "0")}
                  </span>
                </div>

                <button
                  aria-label="Next learner story"
                  className={`${styles.navButton} ${styles.nextButton}`}
                  disabled={isTransitioning}
                  onClick={() => moveTo(currentIndex + 1, "next")}
                  type="button"
                >
                  <span className={styles.navLabel}>Next story</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
