import { getPublicCollection } from "./api";

export function getPartners() {
  return getPublicCollection("partners");
}
