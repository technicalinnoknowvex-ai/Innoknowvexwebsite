"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { startCheckout } from "../../../lib/checkout";
import { getProgramPricing } from "../../../services/programService";
import LoadingIndicator from "../../common/LoadingIndicator/LoadingIndicator";
import styles from "./ProgramPricing.module.css";

const planBenefits = [
  { label: "Recorded session", selfLearning: true, mentorPaced: true, professional: true },
  { label: "Hands-on internship", selfLearning: true, mentorPaced: true, professional: true },
  { label: "Hands-on project", selfLearning: true, mentorPaced: true, professional: true },
  { label: "Certification", selfLearning: true, mentorPaced: true, professional: true },
  { label: "Doubt clearing", selfLearning: false, mentorPaced: true, professional: true },
  { label: "Live session", selfLearning: false, mentorPaced: true, professional: true },
  { label: "Mentor guidance", selfLearning: false, mentorPaced: true, professional: true },
  { label: "Placement", selfLearning: false, mentorPaced: false, professional: true },
  { label: "Mock interview", selfLearning: false, mentorPaced: false, professional: true },
];

const planDetails = [
  {
    key: "selfLearning",
    name: "Self-Learning",
    description: "Learn at your own pace with the resources you need to succeed independently.",
  },
  {
    key: "mentorPaced",
    name: "Mentor-Paced",
    description: "Get personalized guidance, mentor support, and live sessions for accelerated learning.",
  },
  {
    key: "professional",
    name: "Professional",
    description: "Complete career transformation with placement support, mock interviews, and mentorship.",
    featured: true,
  },
];

function formatPrice(amount, currency) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function PricingCard({
  benefits,
  currency,
  description,
  name,
  price,
  featured,
  flatRate,
  onEnroll,
}) {
  return (
    <article className={`${styles.card} ${featured ? styles.featuredCard : ""}`}>
      {featured && <span className={styles.popularBadge}>CAREER-READY</span>}
      <div className={styles.cardHeading}>
        <span className={styles.planMark} aria-hidden="true">✦</span>
        <h3>{name}</h3>
      </div>
      <div className={styles.priceBlock}>
        <p className={styles.currentPrice}>{formatPrice(price.currentPrice, currency)}</p>
        {price.actualPrice > price.currentPrice && (
          <p className={styles.actualPrice}>{formatPrice(price.actualPrice, currency)}</p>
        )}
      </div>
      <p className={styles.description}>{description}</p>
      <button className={styles.enrollButton} onClick={onEnroll} type="button">
        Enroll Now <span aria-hidden="true">→</span>
      </button>
      <ul className={styles.benefits} aria-label={`${name} benefits`}>
        {benefits.map(({ label, included }) => (
          <li className={included ? styles.included : styles.excluded} key={label}>
            <span aria-hidden="true">{included ? "✓" : "×"}</span>
            {label}
          </li>
        ))}
      </ul>
      {flatRate && <p className={styles.flatRateNote}>One offline program. Every benefit included.</p>}
    </article>
  );
}

export default function ProgramPricing({ courseNames, isOffline, programTitle }) {
  const router = useRouter();
  const [pricing, setPricing] = useState(null);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const lookupKey = courseNames.join("|");

  useEffect(() => {
    let isCurrent = true;
    setPricing(null);
    setError("");

    getProgramPricing(courseNames)
      .then((result) => {
        if (isCurrent) setPricing(result);
      })
      .catch((loadError) => {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load pricing. Please try again.",
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [courseNames, lookupKey, retryCount]);

  if (error) {
    return (
      <section className={styles.section} aria-labelledby="pricing-title">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>CHOOSE YOUR LEARNING PATH</span>
          <h2 id="pricing-title">Program pricing</h2>
        </div>
        <div className={styles.errorState} role="alert">
          <p>{error}</p>
          <button onClick={() => setRetryCount((count) => count + 1)} type="button">
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (!pricing) {
    return (
      <section className={styles.section} aria-labelledby="pricing-title" aria-busy="true">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>CHOOSE YOUR LEARNING PATH</span>
          <h2 id="pricing-title">Program pricing</h2>
        </div>
        <LoadingIndicator
          className={styles.loadingState}
          label={`Loading pricing for ${programTitle}…`}
        />
      </section>
    );
  }

  if (isOffline) {
    const benefits = planBenefits.map(({ label }) => ({ label, included: true }));

    return (
      <section className={styles.section} aria-labelledby="pricing-title">
        <div className={styles.heading}>
          <span className={styles.eyebrow}>ONE COMPLETE OFFLINE EXPERIENCE</span>
          <h2 id="pricing-title">Everything included, in person</h2>
          <p>One offline enrollment includes every program benefit, from guided learning to career support.</p>
        </div>
        <div className={styles.offlineGrid}>
          <PricingCard
            benefits={benefits}
            currency={pricing.currency}
            description="Learn in person with hands-on practice, dedicated guidance, and complete career support."
            flatRate
            name="Complete Offline Program"
            onEnroll={() => startCheckout({
              courseName: pricing.courseName,
              planKey: "offline_all_inclusive",
              programTitle,
              router,
            })}
            price={pricing.selfLearning}
          />
          <aside className={styles.offlineCallout}>
            <span className={styles.calloutIcon} aria-hidden="true">✦</span>
            <h3>All the support. One enrollment.</h3>
            <p>Get live learning, mentor guidance, internship experience, certification, placement support, and mock interviews together.</p>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="pricing-title">
      <div className={styles.heading}>
        <span className={styles.eyebrow}>CHOOSE YOUR LEARNING PATH</span>
        <h2 id="pricing-title">Invest in the way you want to grow</h2>
        <p>Every path builds practical skills. Choose the level of guidance and career support that fits you.</p>
      </div>
      <div className={styles.cardGrid}>
        {planDetails.map((plan) => (
          <PricingCard
            benefits={planBenefits.map(({ label, [plan.key]: included }) => ({ label, included }))}
            currency={pricing.currency}
            description={plan.description}
            featured={plan.featured}
            key={plan.key}
            name={plan.name}
            onEnroll={() => startCheckout({
              courseName: pricing.courseName,
              planKey: plan.key,
              programTitle,
              router,
            })}
            price={pricing[plan.key]}
          />
        ))}
      </div>
    </section>
  );
}
