"use client";

import { useEffect, useState } from "react";
import styles from "./DiwaliCelebration.module.css";

const fireworks = [
  { className: styles.fireworkOne, color: "gold" },
  { className: styles.fireworkTwo, color: "pink" },
  { className: styles.fireworkThree, color: "blue" },
  { className: styles.fireworkFour, color: "orange" },
  { className: styles.fireworkFive, color: "violet" },
  { className: styles.fireworkSix, color: "pink" },
  { className: styles.fireworkSeven, color: "gold" },
  { className: styles.fireworkEight, color: "blue" },
  { className: styles.fireworkNine, color: "orange" },
];

function Diya() {
  return (
    <svg className={styles.diya} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="48" rx="23" ry="8" fill="#b84a23" />
      <path d="M9 46c3 9 12 13 23 13s20-4 23-13c-12 5-34 5-46 0Z" fill="#f28a36" />
      <path d="M32 40c-11-8 1-15 2-23 10 10 10 17 2 24Z" fill="#ffc94e" />
      <path d="M34 40c-5-5 1-9 2-13 5 6 4 10 0 14Z" fill="#fff1a8" />
      <ellipse cx="32" cy="45" rx="4" ry="2" fill="#70402a" />
    </svg>
  );
}

export default function DiwaliCelebration() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(false), 10500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.celebration} aria-hidden="true">
      {fireworks.map(({ className, color }) => (
        <span key={className} className={`${styles.firework} ${className}`} data-color={color} />
      ))}
      <div className={styles.greeting}>
        <div className={styles.greetingOrnament}>
          <span className={styles.ornamentLine} />
          <Diya />
          <span className={styles.festivalLabel}>THE FESTIVAL OF LIGHTS</span>
          <Diya />
          <span className={styles.ornamentLine} />
        </div>
        <span>
          <strong>Happy Diwali</strong>
          <small>May your world shine brighter this Diwali</small>
        </span>
        <div className={styles.greetingStars} aria-hidden="true">✦ <span>✧</span> ✦</div>
      </div>
    </div>
  );
}
