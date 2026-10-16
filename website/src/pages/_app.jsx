import Head from "next/head";
import "../app/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/3d.png" />
        <link rel="shortcut icon" href="/3d.png" />
        <link rel="apple-touch-icon" href="/3d.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
