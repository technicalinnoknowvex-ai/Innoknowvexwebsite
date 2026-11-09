import { API_BASE_URL } from "../services/api";

export async function sendAssistantMessage(accessToken, message) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/assistant/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
  } catch {
    throw new Error("Unable to connect to ORVEXA. Please check your connection and try again.");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("ORVEXA returned an invalid response. Please try again.");
  }

  if (!response.ok) {
    const error = new Error(
      (typeof result.error === "string" && result.error) ||
        `ORVEXA could not respond (HTTP ${response.status}).`,
    );
    error.status = response.status;
    throw error;
  }

  if (typeof result.data?.reply !== "string" || !result.data.reply.trim()) {
    throw new Error("ORVEXA returned an empty response. Please try again.");
  }

  return result.data.reply;
}
