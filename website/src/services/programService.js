import { getPublicCollection } from "./api";

export function getPrograms() {
  return getPublicCollection("programs");
}
