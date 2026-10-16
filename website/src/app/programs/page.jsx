import ProgramCatalog from "../../features/programs/ProgramCatalog";

export const metadata = {
  title: "Career Training & Internship Programs",
  description:
    "Explore Innoknowvex programs in technology, business, and professional skills. Compare training options and find a program that fits your goals.",
  alternates: {
    canonical: "/programs",
  },
};

export default function ProgramsPage() {
  return <ProgramCatalog />;
}
