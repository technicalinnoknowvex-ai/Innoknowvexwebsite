import { API_BASE_URL, getPublicCollection } from "./api";

export function getPrograms() {
  return getPublicCollection("programs");
}

export async function getProgramBySlug(slug) {
  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/programs/${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
  } catch {
    throw new Error("Unable to connect. Please check that the service is available.");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response. Please try again.");
  }

  if (!response.ok) {
    throw new Error(
      (typeof result.error === "string" && result.error) ||
        `The request could not be completed (HTTP ${response.status}).`,
    );
  }

  if (!result.data || typeof result.data !== "object" || Array.isArray(result.data)) {
    throw new Error("The server returned program data in an unexpected format.");
  }

  return result.data;
}

export async function getProgramPricing(courseNames) {
  const query = courseNames
    .map((courseName) => `courseName=${encodeURIComponent(courseName)}`)
    .join("&");
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/program-pricing?${query}`, {
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to connect. Please check that the service is available.");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid pricing response.");
  }

  if (!response.ok) {
    throw new Error(
      (typeof result.error === "string" && result.error) ||
        `The pricing request could not be completed (HTTP ${response.status}).`,
    );
  }

  if (!result.data || typeof result.data !== "object" || Array.isArray(result.data)) {
    throw new Error("The server returned pricing data in an unexpected format.");
  }

  return result.data;
}
