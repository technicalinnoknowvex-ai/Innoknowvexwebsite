import styles from "./HeroSection.module.css";
import Image from "next/image";
import Link from "next/link";
import heroBackground from "../../../assets/images/hero/home.png";
import brandLogo from "../../../assets/images/hero/logo.png";

const navItems = [
  "Home",
  "Programs",
  "ORVEXA",
  "About",
  "Contact",
];

const learnerAvatars = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&crop=faces&w=96&h=96&q=85",
];

export default function HeroSection() {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-17 bg-white">
        <div className="mx-auto h-full max-w-[1280px] px-5 md:px-8">
          <nav className="flex h-full items-center justify-between gap-4 text-slate-900">
            <Image
              src={brandLogo}
              alt="INNOKNOWVEX"
              width={180}
              height={44}
              priority
              className="h-22 w-auto object-contain mix-blend-multiply"
            />

            <div className="hidden items-center gap-8 text-sm font-medium text-slate-700 lg:flex">
              {navItems.map((item, index) => (
                <a
                  key={item}
                  href="#"
                  className={
                    index === 0
                      ? "border-b-2 border-[#1ea6ff] pb-1 text-slate-950"
                      : "transition hover:text-slate-950"
                  }
                >
                  {item}
                </a>
              ))}
            </div>

            <Link
              href="/auth/student/login"
              className="rounded-full bg-[#1ea6ff] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1ea6ff]/30 transition hover:bg-[#39b5ff]"
            >
              Log In / Sign Up
            </Link>
          </nav>
        </div>
      </div>

      <header
        className={`relative overflow-hidden bg-[#031d47] text-white ${styles.hero}`}
        style={{
          backgroundImage: `url(${heroBackground.src})`,
        }}
      >
        <div className="absolute inset-0 bg-[#031d47]/15" />

        <div className="relative z-10">
          <div className="mx-auto max-w-[1280px] px-5 pb-10 pt-14 md:px-8 md:pb-14">
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
