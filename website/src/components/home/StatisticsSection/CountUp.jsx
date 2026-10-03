"use client";

import { useEffect, useRef, useState } from "react";

export default function CountUp({ value, suffix = "", className = "" }) {
  const numberRef = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const element = numberRef.current;
    if (!element) return undefined;

    let animationFrame = 0;
    let hasStarted = false;
    let observer;

    function startCount() {
      if (hasStarted) return;
      hasStarted = true;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        animationFrame = window.requestAnimationFrame(() => setCount(value));
        return;
      }

      const startTime = performance.now();
      const duration = 1800;

      function animate(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        setCount(Math.floor(value * easedProgress));

        if (progress < 1) animationFrame = window.requestAnimationFrame(animate);
      }

      animationFrame = window.requestAnimationFrame(animate);
    }

    if (!("IntersectionObserver" in window)) {
      startCount();
      return () => window.cancelAnimationFrame(animationFrame);
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        startCount();
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [value]);

  return (
    <span ref={numberRef} className={className} aria-label={`${value}${suffix}`}>
      {count}{suffix}
    </span>
  );
}