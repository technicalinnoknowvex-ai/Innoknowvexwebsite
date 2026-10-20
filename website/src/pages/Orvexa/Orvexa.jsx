import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";
import orbitImage from "../../assets/images/orvexa/orbit-transparent.webp";
import robotAnimation from "../../assets/images/orvexa/robot-animation-optimized.webp";
import styles from "./Orvexa.module.css";

export default function Orvexa() {
  return (
    <>
      <Head>
        <title>ORVEXA | Innoknowvex</title>
        <meta
          name="description"
          content="Discover ORVEXA, Innoknowvex's upcoming AI-powered learning and career guidance experience."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Innoknowvex" />
        <meta property="og:title" content="ORVEXA | Innoknowvex" />
        <meta
          property="og:description"
          content="Discover ORVEXA, Innoknowvex's upcoming AI-powered learning and career guidance experience."
        />
        <link
          rel="canonical"
          href={`${(process.env.NEXT_PUBLIC_SITE_URL || "https://www.innoknowvex.in").replace(/\/+$/, "")}/orvexa`}
        />
      </Head>
      <Header activeItem="ORVEXA" />
      <main className={styles.page}>
        <section className={styles.comingSoon} aria-labelledby="orvexa-title">
          <div className={styles.glow} aria-hidden="true" />
          <div className={styles.content}>
            <p className={styles.eyebrow}>Introducing</p>
            <div className={styles.brand}>
              <Image
                alt=""
                className={styles.orbit}
                height={475}
                src={orbitImage}
                unoptimized
                width={640}
              />
              <h1 id="orvexa-title">
                <span aria-hidden="true">RVEXA</span>
                <span className={styles.visuallyHidden}>ORVEXA</span>
              </h1>
            </div>
            <p className={styles.tagline}>AI that works with you</p>
            <h2>Something exciting is on its way.</h2>
            <p className={styles.description}>
              ORVEXA is being built to help you learn smarter, plan your career,
              and make more of every opportunity. Stay tuned.
            </p>
            <span className={styles.comingSoonLabel}>Coming soon</span>
            <Link className={styles.homeLink} href="/">
              <span aria-hidden="true">←</span> Back to home
            </Link>
          </div>
          <div className={styles.robotFrame}>
            <Image
              alt="Friendly ORVEXA AI robot"
              className={styles.robot}
              fill
              priority
              sizes="(max-width: 700px) 76vw, 38vw"
              src={robotAnimation}
              unoptimized
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
