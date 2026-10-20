import { API_BASE_URL } from "./api";

export async function submitStudentLead(lead) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
  } catch {
    throw new Error("We couldn't connect. Please check your connection and try again.");
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
        "We couldn't send your request. Please try again.",
    );
  }

  return result;
}
