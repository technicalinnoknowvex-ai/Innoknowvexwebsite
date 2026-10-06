"use client";

import { getBlogs } from "../services/blogService";
import usePublicCollection from "./usePublicCollection";

export default function useBlogs() {
  return usePublicCollection(getBlogs);
}
