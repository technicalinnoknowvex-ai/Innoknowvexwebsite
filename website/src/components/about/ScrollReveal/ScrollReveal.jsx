"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ScrollReveal.module.css";

export default function ScrollReveal({
  as: Element = "div",
  children,
  className = "",
  style,
  ...props
}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Element
      {...props}
      className={`${styles.reveal} ${className}`.trim()}
      data-visible={isVisible}
      ref={elementRef}
      style={style}
    >
      {children}
    </Element>
  );
}
