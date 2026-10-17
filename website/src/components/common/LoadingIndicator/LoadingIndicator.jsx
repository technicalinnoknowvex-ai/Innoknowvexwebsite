import Image from "next/image";
import styles from "./LoadingIndicator.module.css";

export default function LoadingIndicator({ label = "Loading…", className = "" }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className={`${styles.loader} ${className}`.trim()}
      role="status"
    >
      <span className={styles.logoFrame} aria-hidden="true">
        <Image
          alt=""
          className={styles.logo}
          height={112}
          priority
          src="/3d.png"
          width={112}
        />
        <span className={styles.ring} />
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
