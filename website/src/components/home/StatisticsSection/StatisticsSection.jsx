import styles from "./StatisticsSection.module.css";

const statistics = [
  { value: "50K+", label: "Students Trained", icon: "students" },
  { value: "200+", label: "Institutional Partners", icon: "institutions" },
  { value: "100+", label: "Industry-Relevant Programs", icon: "programs" },
  { value: "95%", label: "Learner Satisfaction", icon: "satisfaction" },
];

function StatisticIcon({ type }) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "students" && (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20v-1a6 6 0 0 1 12 0v1" />
          <path d="M16 5.2a3 3 0 0 1 0 5.6M18 14a5 5 0 0 1 3 4.6V20" />
        </>
      )}
      {type === "institutions" && (
        <>
          <path d="m3 9 9-6 9 6" />
          <path d="M5 10v9m4-9v9m6-9v9m4-9v9M3 21h18M2 9h20" />
        </>
      )}
      {type === "programs" && (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 13h8m-8 4h8" />
        </>
      )}
      {type === "satisfaction" && (
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z" />
      )}
    </svg>
  );
}

export default function StatisticsSection() {
  return (
    <section className={styles.section} aria-label="Innoknowvex impact">
      <div className={styles.statistics}>
        {statistics.map((statistic) => (
          <div className={styles.statistic} key={statistic.label}>
            <StatisticIcon type={statistic.icon} />
            <div className={styles.copy}>
              <strong>{statistic.value}</strong>
              <span>{statistic.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
