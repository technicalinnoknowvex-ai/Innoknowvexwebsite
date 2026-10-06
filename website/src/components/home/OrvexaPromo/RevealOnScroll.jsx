"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./RevealOnScroll.module.css";

export default function RevealOnScroll({ children, className = "" }) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      data-revealed={isVisible}
      className={`${styles.reveal} ${isVisible ? styles.visible : ""} ${className}`}
    >
      {children}
    </div>
  );
}