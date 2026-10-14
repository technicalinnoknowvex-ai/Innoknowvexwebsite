"use client";

import { useParams } from "next/navigation";
import ProgramDetails from "../../../pages/ProgramDetails/ProgramDetails";

export default function ProgramDetailsPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  return <ProgramDetails slug={slug} />;
}
