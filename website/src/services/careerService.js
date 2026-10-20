import { API_BASE_URL } from "./api";

async function requestCareerApi(path, options) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/careers/${path}`, {
      cache: "no-store",
      ...options,
    });
  } catch {
    throw new Error("We couldn't connect to the careers service. Please try again.");
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

  return result;
}

export async function getOpenCareerJobs() {
  const result = await requestCareerApi("jobs");
  if (!Array.isArray(result.data)) {
    throw new Error("The careers service returned an unexpected response.");
  }
  return result.data;
}

export function submitCareerApplication(application) {
  return requestCareerApi("applications", {
    method: "POST",
    body: application,
  });
}
