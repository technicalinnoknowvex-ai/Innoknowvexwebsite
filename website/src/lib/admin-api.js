import { API_BASE_URL } from "../services/api";

export async function adminRequest(path, accessToken, { method = "GET", body } = {}) {
  const isFormData = body instanceof FormData;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
  };
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/${path}`, {
      method,
      headers,
      ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
      cache: "no-store",
    });
  } catch {
    throw new Error("Unable to connect to the admin service. Check that the backend is available.");
  }

  if (response.status === 204) return null;

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The admin service returned an invalid response.");
  }

  if (!response.ok) {
    const error = new Error(
      (typeof result.error === "string" && result.error) ||
        `The request could not be completed (HTTP ${response.status}).`,
    );
    error.status = response.status;
    throw error;
  }

  return result.data;
}
