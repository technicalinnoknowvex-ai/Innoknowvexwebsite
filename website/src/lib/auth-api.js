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
  const fullName = authData.user?.user_metadata?.full_name || authData.user?.email?.split("@")[0] || "Student";
  persistProfileInitial(fullName);
  return true;
}

export function persistProfileInitial(fullName) {
  const initial = String(fullName || "Student").trim().charAt(0).toUpperCase() || "S";
  window.sessionStorage.setItem("innoknowvex_profile_initial", initial);
  window.dispatchEvent(new Event("innoknowvex-auth-change"));
}

export function clearAuthStorage() {
  window.sessionStorage.removeItem("innoknowvex_access_token");
  window.sessionStorage.removeItem("innoknowvex_profile_initial");
  window.dispatchEvent(new Event("innoknowvex-auth-change"));
}

async function authenticatedAuthRequest(endpoint, accessToken, method = "GET", body) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Unable to connect. Please check that the service is available.");
  }

  let result = {};
  if (response.status !== 204) {
    const responseText = await response.text();
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = {};
    }
  }

  if (!response.ok) {
    const responseMessage =
      (typeof result.error === "string" && result.error) ||
      (typeof result.message === "string" && result.message);
    const fallbackMessage = response.status === 404
      ? "The requested API endpoint was not found. Restart the backend and try again."
      : `The request could not be completed (HTTP ${response.status}).`;
    const error = new Error(responseMessage || fallbackMessage);
    error.status = response.status;
    throw error;
  }

  return result.data;
}

export function getCurrentUser(accessToken) {
  return authenticatedAuthRequest("me", accessToken);
}

export function updateStudentProfile(accessToken, fullName) {
  return authenticatedAuthRequest("me", accessToken, "PUT", { fullName });
}

export function getStudentPortfolio(accessToken) {
  return authenticatedAuthRequest("me/portfolio", accessToken);
}

export function updateStudentPortfolio(accessToken, portfolio) {
  return authenticatedAuthRequest("me/portfolio", accessToken, "PUT", portfolio);
}

export function logoutUser(accessToken) {
  return authenticatedAuthRequest("logout", accessToken, "POST");
}