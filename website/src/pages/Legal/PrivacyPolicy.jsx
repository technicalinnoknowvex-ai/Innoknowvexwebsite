import Head from "next/head";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";
import styles from "./PrivacyPolicy.module.css";

const policySections = [
  {
    title: "1. Information We Collect",
    content:
      "We may collect information such as your name, email address, phone number, course preference, academic details, and communication history when you fill forms, enquire about programs, or interact with our services.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use your information to respond to your enquiries, provide course information, process enrollments, send updates, support admissions, improve student experience, and maintain communication related to our services.",
  },
  {
    title: "3. Sharing of Information",
    content:
      "We do not sell or rent your personal information. Your information may be shared only with trusted service providers, internal teams, or partners who help us operate our website and deliver services, strictly under confidentiality obligations.",
  },
  {
    title: "4. Cookies and Analytics",
    content:
      "We may use cookies, analytics tools, and similar technologies to understand website traffic, improve user experience, and analyze usage patterns. These tools may collect general non-personal information such as browser type, device information, and on-site activity.",
  },
  {
    title: "5. Data Security",
    content:
      "We take reasonable technical and organizational measures to protect your personal information against unauthorized access, misuse, disclosure, or loss. However, no method of transmission over the Internet is completely secure.",
  },
  {
    title: "6. Your Rights",
    content:
      "You may contact us to request access, correction, or deletion of your personal information, or to ask questions about how your data is used. We will respond in line with applicable laws and our internal policies.",
  },
];

export default function PrivacyPolicy() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/+$/,
    "",
  );

  return (
    <>
      <Head>
        <title>Privacy Policy | Innoknowvex</title>
        <meta
          name="description"
          content="Read how Innoknowvex collects, uses, stores, and protects your personal information when you use our website and services."
        />
        <link rel="canonical" href={`${siteUrl}/Legal/PrivacyPolicy`} />
      </Head>
      <Header activeItem="Legal" />
      <main className={styles.page}>
        <article className={styles.policy}>
          <p className={styles.eyebrow}>Legal</p>
          <h1>Privacy Policy</h1>
          <p>
            At Innoknowvex, we value your privacy and are committed to protecting
            the personal information you share with us. This Privacy Policy
            explains how we collect, use, store, and protect your information
            when you visit our website, browse our courses, or contact us for
            training or enrollment.
          </p>

          {policySections.map((section) => (
            <section className={styles.section} key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.content}</p>
            </section>
          ))}

          <section className={styles.section}>
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please reach
              out to us at{" "}
              <a href="mailto:support@innoknowvex.in">
                support@innoknowvex.in
              </a>{" "}
              or call <a href="tel:+919535788085">+91 9535788085</a>.
            </p>
          </section>

          <p className={styles.updateNote}>
            This policy may be updated from time to time to reflect changes in
            legal requirements or our services. Any updates will be posted on
            this page.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
