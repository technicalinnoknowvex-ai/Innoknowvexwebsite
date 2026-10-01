import styles from "./HeroSection.module.css";
import Header from "../../layout/Header/Header";
import heroBackground from "../../../assets/images/hero/home.png";

const learnerAvatars = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
];

export default function HeroSection() {
  return (
    <>
      <Header fixed activeItem="Home" />

      <header
        className={`relative overflow-hidden bg-white text-white ${styles.hero}`}
        style={{
          backgroundImage: `url(${heroBackground.src})`,
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[92%] bg-[#031d47]/15 max-[900px]:h-full" />

        <div className="relative z-10">
          <div className="mx-auto max-w-[1280px] px-5 pb-6 pt-14 md:px-8 md:pb-1">
          <div className="relative min-h-[620px]">
            <div className="absolute inset-0" />

            <div className="relative z-10 flex min-h-[620px] items-center">
              <div className="max-w-[620px] pb-16 pl-2 md:pl-0">
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#dfeeff]">
                  Skills • Internships • AI • A brighter future
                </p>

                <h1 className="max-w-[560px] text-5xl font-black leading-[0.9] tracking-[-0.06em] text-white md:text-7xl">
                  Building People
                  <span className="mt-2 block text-white">
                    for a <span className="text-[#29a7f9]">Smarter</span>
                  </span>
                  <span className="mt-2 block text-[#29a7f9]">Tomorrow</span>
                </h1>

                <p className="mt-6 max-w-[520px] text-lg leading-8 text-slate-200">
                  Innoknowvex empowers students, professionals and institutions with
                  industry-ready skills, real-world internships and AI-powered career
                  opportunities.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button className="rounded-lg bg-[#02b1fc] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[#1ea6ff]/35 transition hover:bg-[#38b7ff]">
                    Explore Programs →
                  </button>
                  <button className="rounded-lg border border-white/30 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10">
                    About Us
                  </button>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {learnerAvatars.map((avatar) => (
                      <img
                        key={avatar}
                        src={avatar}
                        alt="Learner portrait"
                        className="h-10 w-10 rounded-full border-2 border-[#031d47] object-cover"
                      />
                    ))}
                  </div>
                  <p className="text-base font-medium text-slate-200">
                    <span className="font-bold text-white">50,000+</span> learners trust
                    innoknowvex
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </header>
    </>
  );
}
