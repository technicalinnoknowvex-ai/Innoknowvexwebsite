"use client";

import { getTestimonials } from "../services/testimonialService";
import usePublicCollection from "./usePublicCollection";

export default function useTestimonials() {
  return usePublicCollection(getTestimonials);
}
