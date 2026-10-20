import Image from "next/image";
import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import orbitImage from "../../../assets/images/orvexa/orbit-transparent.webp";
import robotAnimation from "../../../assets/images/orvexa/robot-animation-optimized.webp";
import styles from "./OrvexaPromo.module.css";
import RevealOnScroll from "./RevealOnScroll";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

const orvexaFeatures = [
  "Learn Smarter",
  "Plan Your Career",
  "Get Opportunities",
  "Boost Productivity",
  "Your AI Companion",
];

export default function OrvexaSection() {
  return (
    <section className={styles.section} aria-labelledby="orvexa-title">
      <RevealOnScroll className={styles.promo}>
        <div className={styles.copy}>
          <p className={styles.intro}>INTRODUCING</p>
          <div className={styles.wordmark}>
            <Image
              src={orbitImage}
              alt=""
              width={640}
              height={475}
              unoptimized
              className={styles.orbitImage}
            />
            <h2 id="orvexa-title" aria-label="ORVEXA">
              <span aria-hidden="true">RVEXA</span>
            </h2>
          </div>
          <p className={styles.brandLine}>
            AI THAT <span className={styles.brandAccent}>WORKS WITH YOU</span>
          </p>
          <p className={styles.byline}>by INNOKNOWVEX</p>
          <p className={styles.description}>
            Your AI companion for learning, careers, productivity and a brighter future.
          </p>
          <div className={styles.actions}>
            <Link href="/orvexa" className={styles.exploreButton}>
              Explore ORVEXA <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className={styles.robotFrame}>
          <Image
            src={robotAnimation}
            unoptimized
            alt="Friendly ORVEXA AI robot"
            fill
            sizes="(max-width: 700px) 80vw, 38vw"
            className={styles.robot}
          />
        </div>

        <ul className={styles.features}>
          {orvexaFeatures.map((feature) => (
            <li key={feature}>
              <span className={styles.check} aria-hidden="true">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        <p className={`${styles.tagline} ${dancingScript.className}`}>
          <span className={styles.taglineTop}>More</span>
          <span className={styles.taglineBottom}>Than Just AI</span>
        </p>
      </RevealOnScroll>
    </section>
  );
}
