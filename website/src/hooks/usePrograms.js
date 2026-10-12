"use client";

import { getPrograms } from "../services/programService";
import usePublicCollection from "./usePublicCollection";

const loadPrograms = () => getPrograms();

export default function usePrograms() {
  return usePublicCollection(loadPrograms);
}
