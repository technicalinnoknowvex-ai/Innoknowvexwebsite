import Head from "next/head";
import Footer from "../../components/layout/Footer/Footer";
import Header from "../../components/layout/Header/Header";
import styles from "./PrivacyPolicy.module.css";

const sections = [
  {
    title: "1. Workshops & Events",
    paragraphs: [
      "Payments made towards workshops, seminars, webinars, bootcamps, events, or similar short-term programs are non-refundable and non-transferable, unless otherwise specifically stated by Innoknowvex in writing.",
      "Once a seat has been confirmed, the applicable fee cannot be refunded due to non-attendance, change of plans, personal circumstances, or any other reason attributable to the participant.",
    ],
  },
  {
    title: "2. Courses & Training Programs",
    paragraphs: [
      "Fees paid for courses, certification programs, skill-development programs, training programs, or other educational services are generally non-refundable once enrollment has been confirmed or the program has commenced.",
      "We encourage learners to carefully evaluate their availability, requirements, and commitment before enrolling.",
      "In exceptional circumstances, Innoknowvex may, at its sole discretion, consider a request for transfer to a future batch or cohort, subject to the following:",
    ],
    list: [
      "Availability of the requested batch or cohort.",
      "Applicable administrative or transfer charges.",
      "The terms and conditions applicable to that particular program.",
      "Approval from the authorized team at Innoknowvex.",
    ],
    closing:
      "A transfer to another batch does not automatically create an entitlement to a refund.",
  },
  {
    title: "3. Internship & Career Programs",
    paragraphs: [
      "Payments made towards internship programs, career-development programs, placement-oriented programs, mentorship programs, or bundled learning experiences are non-refundable once the enrollment/onboarding process has been completed, unless otherwise communicated in writing by Innoknowvex.",
      "Participants are expected to review the program structure, deliverables, duration, and applicable terms before making payment.",
    ],
  },
  {
    title: "4. Cancellation by the Participant",
    paragraphs: [
      "If a participant voluntarily chooses to discontinue, withdraw from, or stop participating in a program after enrollment, the amount paid shall generally not be eligible for a refund.",
      "Non-participation, failure to attend sessions, failure to complete assignments, lack of communication, or personal scheduling conflicts will not ordinarily qualify for a refund.",
    ],
  },
  {
    title: "5. Duplicate or Incorrect Payments",
    paragraphs: [
      "If a customer accidentally makes a duplicate payment for the same program, they may contact our support team with the relevant transaction details.",
      "After verification, Innoknowvex may process an eligible duplicate-payment refund. Any refund approved under this category will be subject to verification and applicable payment-processing conditions.",
    ],
  },
  {
    title: "6. Payment Gateway & Transaction Charges",
    paragraphs: [
      "Where a refund is approved, any applicable payment gateway, transaction, banking, processing, or administrative charges may be deducted from the refundable amount, where legally and operationally applicable.",
    ],
  },
  {
    title: "7. Program Cancellation or Modification by Innoknowvex",
    paragraphs: [
      "In the unlikely event that Innoknowvex cancels a program or is unable to deliver a program as originally scheduled, the company may provide an appropriate alternative, such as:",
    ],
    list: [
      "Rescheduling the program.",
      "Transfer to another available batch.",
      "Credit towards another eligible program.",
      "Refund, where applicable and at the discretion of Innoknowvex, subject to the circumstances.",
    ],
    closing:
      "The specific resolution will depend on the nature of the program and the circumstances leading to the cancellation or modification.",
  },
  {
    title: "8. Refund Processing",
    paragraphs: [
      "Where a refund has been approved, it will normally be processed through the original payment method or another appropriate method communicated by Innoknowvex.",
      "The time taken for the amount to reflect in the customer's account may depend on the payment gateway, bank, or financial institution.",
    ],
  },
  {
    title: "9. No Refund for Promotional or Special Offers",
    paragraphs: [
      "Fees paid under promotional offers, discounted plans, special campaigns, early-bird offers, or other specially negotiated pricing may be subject to additional terms and may be non-refundable, unless expressly stated otherwise at the time of purchase.",
    ],
  },
  {
    title: "10. Policy Updates",
    paragraphs: [
      "Innoknowvex Edutech Private Limited reserves the right to modify or update this Refund & Cancellation Policy from time to time. Any revised policy will be published on our official website and will apply to transactions made after the effective date of the revised policy.",
    ],
  },
];

export default function RefundPolicy() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/+$/,
    "",
  );

  return (
    <>
      <Head>
        <title>Refund & Cancellation Policy | Innoknowvex</title>
        <meta
          name="description"
          content="Review the Innoknowvex refund, cancellation, batch transfer, duplicate payment, and refund processing policy."
        />
        <link rel="canonical" href={`${siteUrl}/Legal/RefundPolicy`} />
      </Head>
      <Header activeItem="Legal" />
      <main className={styles.page}>
        <article className={styles.policy}>
          <p className={styles.eyebrow}>Legal</p>
          <h1>Refund &amp; Cancellation Policy</h1>
          <p>
            Innoknowvex Edutech Private Limited is committed to providing
            quality educational, training, internship, workshop, and
            skill-development programs. We encourage all customers and learners
            to carefully review the program details, duration, eligibility,
            fees, and other applicable terms before making a payment.
          </p>
          <p className={styles.paragraph}>
            By completing a payment or enrolling in any program offered by
            Innoknowvex, you acknowledge and agree to the following Refund &amp;
            Cancellation Policy.
          </p>

          {sections.map((section) => (
            <section className={styles.section} key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p className={styles.paragraph} key={paragraph}>
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className={styles.list}>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.closing && (
                <p className={styles.paragraph}>{section.closing}</p>
              )}
            </section>
          ))}

          <section className={styles.section}>
            <h2>11. Contact Us</h2>
            <p className={styles.paragraph}>
              If you have questions regarding payments, cancellations,
              transfers, or refunds, please contact our support team:
            </p>
            <p className={styles.paragraph}>
              Innoknowvex Edutech Private Limited
              <br />
              Email:{" "}
              <a href="mailto:support@innoknowvex.in">
                support@innoknowvex.in
              </a>
              <br />
              Support: <a href="tel:+919535788085">+91 95357 88085</a>
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
