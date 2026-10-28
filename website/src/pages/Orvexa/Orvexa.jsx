import Head from "next/head";
import OrvexaPage from "../../components/orvexa/OrvexaPage";

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
      <OrvexaPage />
    </>
  );
}
