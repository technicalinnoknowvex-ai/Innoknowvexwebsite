import CareersPage from "../../components/careers/CareersPage";

export const metadata = {
  title: "Careers at Innoknowvex",
  description:
    "Explore open roles at Innoknowvex and apply to help build practical learning and career opportunities.",
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersRoute() {
  return <CareersPage />;
}
