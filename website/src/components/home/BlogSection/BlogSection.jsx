"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import useBlogs from "../../../hooks/useBlogs";
import styles from "./BlogSection.module.css";

const BLOGS_PER_PAGE = 3;

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function BlogImage({ blog }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (!blog.imageUrl || hasImageError) {
    return (
      <div className={styles.imageFallback} aria-hidden="true">
        <span className={styles.fallbackOrb} />
        <span className={styles.fallbackMark}>IK</span>
      </div>
    );
  }

  return (
    <Image
      alt=""
      className={styles.image}
      fill
      onError={() => setHasImageError(true)}
      sizes="(max-width: 680px) 92vw, (max-width: 1000px) 45vw, 30vw"
      src={blog.imageUrl}
      unoptimized
    />
  );
}

function BlogCard({ blog, featured = false }) {
  const date = formatDate(blog.createdAt);
  const canRead =
    typeof blog.link === "string" &&
    /^https?:\/\//i.test(blog.link.trim());

  return (
    <article
      className={`${styles.card} ${featured ? styles.featuredCard : ""}`}
    >
      <a
        className={styles.imageLink}
        href={canRead ? blog.link : undefined}
        target={canRead ? "_blank" : undefined}
        rel={canRead ? "noreferrer" : undefined}
        tabIndex={canRead ? undefined : -1}
        aria-label={canRead ? `Read ${blog.title}` : undefined}
      >
        <BlogImage blog={blog} />
        <span className={styles.imageEyebrow}>INNOKNOWVEX INSIGHTS</span>
      </a>

      <div className={styles.cardBody}>
        {date && <time className={styles.date}>{date}</time>}
        <h3 className={styles.cardTitle}>{blog.title}</h3>
        <p className={styles.cardDescription}>{blog.description}</p>
        {canRead && (
          <a
            className={styles.readLink}
            href={blog.link}
            target="_blank"
            rel="noreferrer"
          >
            Read article <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}

export default function BlogSection() {
  const { items: blogs, isLoading, error, retry } = useBlogs();
  const [currentPage, setCurrentPage] = useState(0);
  const orderedBlogs = useMemo(
    () =>
      [...blogs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [blogs],
  );
  const pageCount = Math.ceil(orderedBlogs.length / BLOGS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(0, pageCount - 1));

  function showPage(page) {
    setCurrentPage(Math.max(0, Math.min(page, pageCount - 1)));
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="blog-section-title"
      id="blogs"
    >
      <div className={styles.inner}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>Ideas for what’s next</p>
          <h2 className={styles.title} id="blog-section-title">
            Insights to Inspire Your Journey
          </h2>
          <p className={styles.intro}>
            Explore perspectives on technology, practical learning, and the
            careers shaping tomorrow.
          </p>
        </header>

        {isLoading && (
          <div className={styles.grid} role="status" aria-label="Loading articles">
            {Array.from({ length: BLOGS_PER_PAGE }, (_, index) => (
              <div className={styles.skeletonCard} key={index}>
                <span className={styles.skeletonImage} />
                <span className={styles.skeletonTitle} />
                <span className={styles.skeletonText} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className={styles.message} role="alert">
            <span>Articles could not be loaded: {error}</span>
            <button className={styles.retry} onClick={retry} type="button">
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && orderedBlogs.length === 0 && (
          <p className={styles.message}>New articles will be shared here soon.</p>
        )}

        {!isLoading && !error && orderedBlogs.length > 0 && (
          <>
            <div className={styles.carousel} aria-live="polite">
              <div
                className={styles.carouselTrack}
                style={{ "--page-index": visiblePage }}
              >
                {Array.from({ length: pageCount }, (_, pageIndex) => {
                  const pageBlogs = orderedBlogs.slice(
                    pageIndex * BLOGS_PER_PAGE,
                    (pageIndex + 1) * BLOGS_PER_PAGE,
                  );

                  return (
                    <div
                      aria-label={`Articles ${pageIndex * BLOGS_PER_PAGE + 1} to ${Math.min((pageIndex + 1) * BLOGS_PER_PAGE, orderedBlogs.length)}`}
                      aria-hidden={pageIndex !== visiblePage}
                      className={styles.carouselPage}
                      inert={pageIndex !== visiblePage}
                      key={pageIndex}
                    >
                      <div className={styles.grid}>
                        {pageBlogs.map((blog) => (
                          <BlogCard blog={blog} key={blog.id} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {pageCount > 1 && (
              <nav className={styles.navigation} aria-label="Blog pages">
                <div className={styles.navigationButtons}>
                  <button
                    aria-label="Show previous blog posts"
                    className={styles.navButton}
                    disabled={visiblePage === 0}
                    onClick={() => showPage(visiblePage - 1)}
                    type="button"
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <button
                    aria-label="Show next blog posts"
                    className={`${styles.navButton} ${styles.nextButton}`}
                    disabled={visiblePage >= pageCount - 1}
                    onClick={() => showPage(visiblePage + 1)}
                    type="button"
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
