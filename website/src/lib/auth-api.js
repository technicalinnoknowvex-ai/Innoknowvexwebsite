const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

async function postAuthRequest(endpoint, body) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Unable to connect. Please check that the service is available.");
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Authentication failed. Please try again.");
  }

  return result.data;
}

export function loginWithPassword(credentials) {
  return postAuthRequest("login", credentials);
}

export function registerWithPassword(details) {
  return postAuthRequest("register", details);
}

export function persistAccessToken(authData) {
  const accessToken = authData?.session?.access_token;

  if (!accessToken) return false;

  window.sessionStorage.setItem("innoknowvex_access_token", accessToken);
  return true;
}