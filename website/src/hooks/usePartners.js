"use client";

import { getPartners } from "../services/partnerService";
import usePublicCollection from "./usePublicCollection";

export default function usePartners() {
  return usePublicCollection(getPartners);
}
