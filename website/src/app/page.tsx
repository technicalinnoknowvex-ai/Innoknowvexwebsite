import HeroSection from "../components/home/HeroSection/HeroSection";
import OrvexaSection from "../components/home/OrvexaPromo/OrvexaPromo";
import PopularPrograms from "../components/home/PopularPrograms/PopularPrograms";
import StatisticsSection from "../components/home/StatisticsSection/StatisticsSection";
import WhyInnoknowvex from "../components/home/WhyInnoknowvex/WhyInnoknowvex";

export default function Home() {
  return (
    <>
      <HeroSection />
      <OrvexaSection />
      <StatisticsSection />
      <PopularPrograms />
      <WhyInnoknowvex />
    </>
  );
}
