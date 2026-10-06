import { getPublicCollection } from "./api";

export function getTestimonials() {
  return getPublicCollection("testimonials");
}
