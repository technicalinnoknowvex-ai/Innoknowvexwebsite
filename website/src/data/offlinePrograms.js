const images = [
  "https://hfolrvqgjjontjmmaigh.supabase.co/storage/v1/object/public/Innoknowvex%20website%20content/offine/Copy%20of%20AI.png",
  "https://hfolrvqgjjontjmmaigh.supabase.co/storage/v1/object/public/Innoknowvex%20website%20content/offine/Copy%20of%20AIML.png",
  "https://hfolrvqgjjontjmmaigh.supabase.co/storage/v1/object/public/Innoknowvex%20website%20content/offine/Copy%20of%20DATA%20SCIENCE.png",
  "https://hfolrvqgjjontjmmaigh.supabase.co/storage/v1/object/public/Innoknowvex%20website%20content/offine/Copy%20of%20FULLSTACK%20WEB%20DEVELOPMENT.jpg.jpeg",
];

const offlineTrainingSection = {
  heading: "OFFLINE PROGRAMS",
  subHeading: "Build Skills. Build Your Career.",
  description:
    "Our offline programs combine practical learning, expert mentorship, real-world projects, and career-focused training.",
  images,
  programs: [
    {
      number: "01",
      title: "Artificial Intelligence",
      slug: "offline-artificial-intelligence",
      image: images[0],
      description:
        "Learn to apply artificial intelligence through guided projects, practical exercises, and expert-led classroom sessions.",
      benefits: [
        "Hands-on AI learning",
        "Mentor-led classroom sessions",
        "Real-world projects",
        "Career-focused practice",
      ],
      highlights: ["Machine learning", "Neural networks", "Applied AI projects"],
      careerRoles: ["AI Engineer", "AI Consultant", "AI Researcher"],
    },
    {
      number: "02",
      title: "AI & Machine Learning",
      slug: "offline-machine-learning",
      image: images[1],
      description:
        "Build intelligent models through practical machine-learning exercises, real-world case studies, and personal mentorship.",
      benefits: [
        "Project-based curriculum",
        "Guided coding exercises",
        "Industry case studies",
        "Expert mentorship",
      ],
      highlights: ["Supervised learning", "Model building", "Computer vision"],
      careerRoles: ["ML Engineer", "Data Scientist", "AI Engineer"],
    },
    {
      number: "03",
      title: "Data Science",
      slug: "data-science",
      image: images[2],
      description:
        "Turn raw data into clear insights with practical training in statistics, visualization, and predictive modeling.",
      benefits: [
        "Practical analytics training",
        "Guided real-world projects",
        "Mentor support",
        "Industry-ready skills",
      ],
      highlights: ["Statistics", "Data visualization", "Predictive modeling"],
      careerRoles: ["Data Scientist", "Data Analyst", "Business Analyst"],
    },
    {
      number: "04",
      title: "Full Stack Web Development",
      slug: "web-development",
      image: images[3],
      description:
        "Learn to build complete web experiences through hands-on frontend and backend practice, supported by real projects.",
      benefits: [
        "Frontend and backend practice",
        "Portfolio-ready projects",
        "Practical assignments",
        "Mentor-guided learning",
      ],
      highlights: [
        "Frontend development",
        "Backend fundamentals",
        "Full-stack projects",
      ],
      careerRoles: [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
      ],
    },
  ],
};

export default offlineTrainingSection;
