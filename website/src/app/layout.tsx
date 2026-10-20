import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ScrollToTopOnReload from "../components/common/ScrollToTopOnReload/ScrollToTopOnReload";
import StudentGuidancePopup from "../components/common/StudentGuidancePopup/StudentGuidancePopup";
import { getSiteUrl } from "../lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Innoknowvex | Career Training & Internship Programs",
    template: "%s | Innoknowvex",
  },
  description:
    "Build practical, job-ready skills with expert-led training, hands-on projects, and career-focused programs from Innoknowvex.",
  icons: {
    icon: "/3d.png",
    shortcut: "/3d.png",
    apple: "/3d.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Innoknowvex",
    title: "Innoknowvex | Career Training & Internship Programs",
    description:
      "Build practical, job-ready skills with expert-led training, hands-on projects, and career-focused programs.",
    url: "/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Innoknowvex | Career Training & Internship Programs",
    description:
      "Build practical, job-ready skills with expert-led training, hands-on projects, and career-focused programs.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const siteUrl = getSiteUrl();
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Innoknowvex",
    url: siteUrl,
    logo: new URL("/3d.png", siteUrl).toString(),
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ScrollToTopOnReload />
        <StudentGuidancePopup />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
