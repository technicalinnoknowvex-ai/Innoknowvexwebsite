import { getPublicCollection } from "./api";

export function getBlogs() {
  return getPublicCollection("blogs");
}
