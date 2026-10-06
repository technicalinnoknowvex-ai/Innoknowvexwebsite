import Accenture from "@/components/Pages/Landing/Sections/OurPartners/Logos/Accenture";
import AmityUni from "@/components/Pages/Landing/Sections/OurPartners/Logos/AmityUni";
import Boat from "@/components/Pages/Landing/Sections/OurPartners/Logos/Boat";
import Capgemini from "@/components/Pages/Landing/Sections/OurPartners/Logos/Capgemini";
import IBM from "@/components/Pages/Landing/Sections/OurPartners/Logos/IBM";
import KLUni from "@/components/Pages/Landing/Sections/OurPartners/Logos/KLUni";
import Phonepe from "@/components/Pages/Landing/Sections/OurPartners/Logos/Phonepe";
import PresidencyUni from "@/components/Pages/Landing/Sections/OurPartners/Logos/PresidencyUni";
import RangaswamyCollege from "@/components/Pages/Landing/Sections/OurPartners/Logos/RangaswamyCollege";
import Razorpay from "@/components/Pages/Landing/Sections/OurPartners/Logos/Razorpay";
import RevaUni from "@/components/Pages/Landing/Sections/OurPartners/Logos/RevaUni";
import Wipro from "@/components/Pages/Landing/Sections/OurPartners/Logos/Wipro";
import Sona from "@/components/Pages/Landing/Sections/OurPartners/Logos/Sona";
import offlineTrainingSection from "./offlinePrograms";
import footerSection from "./footer";

export const landingPageData = {
  aboutSection: {
    heading: "About Us.",
    subheading: "Get to Know Us Better",
    para: `At Innoknowvex, we don't just prepare students for careers, we help them build their future. We bridge the gap between education and real-world success by offering hands-on internships, industry-focused training, and expert mentorship. Our approach is simple: learn by doing. Through practical programs and guidance from experienced professionals, we empower students to develop the skills, confidence, and insights they need to stand out in today's competitive world. Your journey from classroom to career starts here.`,
    images: [
      "https://hfolrvqgjjontjmmaigh.supabase.co/storage/v1/object/public/Innoknowvex%20website%20content/About%20Us%20Images/Landing/about_us_cell_10%20(1).jpg",
      "https://res.cloudinary.com/dquwagna6/image/upload/v1762236074/about_us_cell_30_1_hha7az.jpg",
      "https://hfolrvqgjjontjmmaigh.supabase.co/storage/v1/object/public/Innoknowvex%20website%20content/About%20Us%20Images/Landing/about_us_cell_40%20(1).jpg",
      "https://hfolrvqgjjontjmmaigh.supabase.co/storage/v1/object/public/Innoknowvex%20website%20content/About%20Us%20Images/Landing/about_us_cell_40%20(1).jpg",
      "https://hfolrvqgjjontjmmaigh.supabase.co/storage/v1/object/public/Innoknowvex%20website%20content/About%20Us%20Images/Landing/about_us_cell_90%20(1).jpg",
    ],
  },
  offlineTrainingSection,
  trainingsSection: {
    heading: "What",
    subheading: "Trainings We're Offering",
    para: `Get equipped with real-world skills, hands-on experience, and career-focused trainings tailored to meet industry demands. Our expert-led trainings are designed to help you build practical knowledge, boost your confidence, and launch a successful career in today's fast-paced, tech-driven world.`,
    trainings: [
      {
        title: "Artificial",
        subTitle: "Intelligence",
        description:
          "Dive into the world of Artificial Intelligence with a hands-on learning experience focused on machine learning, deep learning, and neural networks. Through interactive lessons, real-world projects, and expert guidance, you'll move beyond theory into practical application. Whether you're starting out or upskilling, this training equips you for real-world challenges and success in an AI-driven future.",
        slug: "artificial-intelligence",
        image:
          "https://res.cloudinary.com/dquwagna6/image/upload/v1774874557/AI_wd3nha.jpg",        
        salary: "₹10-18 LPA",        
        careerRoles: ["AI Engineer", "ML Engineer", "AI Researcher", "Data Scientist", "AI Consultant"],
      },
      {
        title: "Data",
        subTitle: "Science",
        description:
          "Explore the field of Data Science through a structured training covering statistics, data visualization, and predictive modeling. With guided projects, step-by-step lessons, and mentorship, you'll build the ability to transform raw data into actionable insights. This training ensures you develop industry-ready skills to solve real problems in analytics and data-driven decision-making.",
        slug: "data-science",
        image:
          "https://res.cloudinary.com/dquwagna6/image/upload/v1774874989/WhatsApp_Image_2026-03-30_at_18.18.20_hm2rd2.jpg",        
        salary: "₹9-15 LPA",        
        careerRoles: ["Data Scientist", "Data Analyst", "Business Analyst", "Analytics Engineer", "Data Engineer"],
      },
      {
        title: "Cyber",
        subTitle: "Security",
        description:
          "Master the fundamentals of Cyber Security with a practical curriculum emphasizing threat detection, ethical hacking, and network defense. Learn through labs, simulations, and expert-led instruction that mirror real-world security challenges. Gain the confidence and skills required to protect digital environments and build a successful career in one of today’s most critical domains.",
        slug: "cyber-security",
        image:
          "https://res.cloudinary.com/dquwagna6/image/upload/v1762238494/Cyber_Security_cxz925.jpg",        
        salary: "₹8-14 LPA",        
        careerRoles: ["Security Engineer", "Ethical Hacker", "SOC Analyst", "Security Consultant", "Network Security Engineer"],
      },
      {
        title: "Cloud",
        subTitle: "Computing",
        description:
          "Step into Cloud Computing with comprehensive training on infrastructure, virtualization, and service deployment across leading platforms. Through hands-on labs, guided exercises, and applied projects, you'll understand the backbone of modern digital solutions. Whether aiming for certifications or career growth, this training equips you to architect, deploy, and manage scalable cloud systems.",
        slug: "cloud-computing",
        image:
          "https://res.cloudinary.com/dquwagna6/image/upload/v1762238485/Cloud_Computing_oahxvt.jpg",       
        salary: "₹9-16 LPA",        
        careerRoles: ["Cloud Architect", "Cloud Engineer", "DevOps Engineer", "Cloud Solutions Architect", "Infrastructure Engineer"],
      },
      {
        title: "Machine",
        subTitle: "Learning",
        description:
          "Gain mastery in Machine Learning through a project-based curriculum emphasizing supervised, unsupervised, and reinforcement learning techniques. With real-world case studies, coding exercises, and expert mentorship, you'll develop the ability to build intelligent models and deploy them in practice. This training prepares you to innovate and excel in AI-powered applications across industries.",
        slug: "machine-learning",
        image:
          "https://res.cloudinary.com/dquwagna6/image/upload/v1762238490/Machine_Learning_uhbcvr.jpg",        
        salary: "₹10-17 LPA",        
        careerRoles: ["ML Engineer", "Data Scientist", "AI Engineer", "ML Researcher", "Computer Vision Engineer"],
      },
    ],
  },
  whyChooseUsSection: {
    heading: "Why choose Us",
    subheading: "What makes our trainings stand out.",
    para: ` We’re not just a platform, we’re your learning partner, here to support your growth every step of the way. From interactive live classes and real-world projects to personalized guidance, everything is designed to help you learn with confidence. Add a welcoming, inspiring community, and your journey becomes not just effective, but truly meaningful and future-ready`,
    reasons: [
      {
        title: "Live",
        subTitle: "Classes",
        description:
          "Learn directly from industry experts in real-time through engaging classes that simplify difficult concepts, encourage active participation, and keep you motivated. With interactive guidance, you gain confidence, build knowledge, and remain consistently focused throughout your complete learning journey.",
      },
      {
        title: "Linkedin &",
        subTitle: "Resume Building",
        description:
          "Develop a professional resume and LinkedIn profile with tailored guidance that highlights your skills, emphasizes achievements, and increases visibility. With expert advice, you learn how to impress recruiters, showcase your strengths, and unlock meaningful career opportunities in today’s competitive job market.",
      },
      {
        title: "100% Job",
        subTitle: "Assistance",
        description:
          "Receive end-to-end career support from a dedicated team that assists with applications, prepares you for interviews, and offers mentorship. You are guided at every step until you confidently secure the right role and achieve ongoing professional success in your chosen path.",
      },
      {
        title: "Interview",
        subTitle: "Training",
        description:
          "Master the art of interviews through structured practice sessions, personalized coaching, and actionable feedback from experts. With confidence-building preparation, you enhance communication, present your skills effectively, and leave recruiters impressed with your professionalism, clarity, and readiness for success in every interview.",
      },
      {
        title: "Placement",
        subTitle: "Assistance",
        description:
          "Gain placement assistance with comprehensive career support from specialists who connect you with employers, guide your applications, and prepare you with effective strategies. Their expert help ensures you feel prepared, stay motivated, and confidently secure roles that match your career ambitions and goals.",
      },
      {
        title: "Lifetime Access",
        subTitle: "to Content",
        description:
          "Enjoy lifetime access to training content, including updated resources, added modules, and future enhancements. Revisit your learning anytime, stay current with industry trends, and continuously improve your skills—ensuring your knowledge grows steadily and remains valuable throughout your entire professional journey.",
      },
    ],
  },
  ourPartnerSection: {
    heading: "Our Partners",
    subheading: "SEE BRANDS THAT TRUSTS US",

    brands: [
      Razorpay,
      IBM,
      Capgemini,
      Boat,
      Accenture,
      Phonepe,
      Wipro,
      Razorpay,
      IBM,
      Capgemini,
      
    ],
    hiringPartners: [
      RangaswamyCollege,
      KLUni,
      AmityUni,
      RevaUni,
      PresidencyUni,
      RangaswamyCollege,
      KLUni,
      AmityUni,
      Sona,
    ],
  },
  faqSection: {
    heading: "Frequently asked questions",
    subheading: "WHAT YOU SHOULD KNOW",
    para: ` Got questions? You’re in the right place. We’ve brought together the most common (and most important) ones to give you clarity and confidence before you decide. Whether you’re exploring, comparing, or just doing your homework, everything you need to know is right here`,
    faqs: [
      {
        question: "Who will be my mentor?",
        answer:
          "You'll be guided by industry professionals with years of hands-on experience in their respective domains. Our mentors focus on concept clarity, practical knowledge, and personalized support throughout your learning journey",
      },
      {
        question: "Can I pay in easy monthly installments?",
        answer:
          "Yes, we offer flexible EMI (Easy Monthly Installment) options to make learning more accessible for everyone.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit/debit cards, UPI, net banking, and EMI options through partnered banks and financial services.",
      },
      {
        question: "Will I receive a certificate after completing the training?",
        answer:
          "Yes, upon successful completion of your training, you'll receive an industry-recognized certificate from Innoknowvex.",
      },
    ],
  },
  footerSection,
};
