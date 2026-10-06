export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export async function getPublicCollection(endpoint) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
      cache: "no-store",
    });
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

  if (!Array.isArray(result.data)) {
    throw new Error("The server returned data in an unexpected format.");
  }

  return result.data;
}

export default API_BASE_URL;
