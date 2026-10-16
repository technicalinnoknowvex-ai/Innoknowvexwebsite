import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/Home/Home", destination: "/", permanent: true },
      { source: "/Blog/Blog", destination: "/#blogs", permanent: true },
      { source: "/BlogDetails/BlogDetails", destination: "/#blogs", permanent: true },
      { source: "/Contact/Contact", destination: "/#contact", permanent: true },
      { source: "/Login/Login", destination: "/auth/student/login", permanent: true },
      { source: "/Signup/Signup", destination: "/auth/student/signup", permanent: true },
      { source: "/Programs/Programs", destination: "/programs", permanent: true },
      { source: "/ProgramDetails/ProgramDetails", destination: "/programs", permanent: true },
    ];
  },
};

export default nextConfig;
