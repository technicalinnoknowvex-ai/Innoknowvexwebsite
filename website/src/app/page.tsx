import HeroSection from "../components/home/HeroSection/HeroSection";
import BlogSection from "../components/home/BlogSection/BlogSection";
import OfflinePrograms from "../components/home/OfflinePrograms/OfflinePrograms";
import OrvexaSection from "../components/home/OrvexaPromo/OrvexaPromo";
import PartnersSection from "../components/home/PartnersSection/PartnersSection";
import PopularPrograms from "../components/home/PopularPrograms/PopularPrograms";
import StatisticsSection from "../components/home/StatisticsSection/StatisticsSection";
import TestimonialsSection from "../components/home/TestimonialsSection/TestimonialsSection";
import WhyInnoknowvex from "../components/home/WhyInnoknowvex/WhyInnoknowvex";
import Footer from "../components/layout/Footer/Footer";

export const metadata = {
  title: "Practical Training, Internships & Career Programs",
  description:
    "Learn by doing with practical training, real-world projects, and career-focused internship programs from Innoknowvex.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <OrvexaSection />
      <StatisticsSection />
      <PopularPrograms />
      <OfflinePrograms />
      <WhyInnoknowvex />
      <PartnersSection />
      <TestimonialsSection />
      <BlogSection />
      <Footer />
    </>
  );
}
