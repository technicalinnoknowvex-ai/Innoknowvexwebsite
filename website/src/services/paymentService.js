import { API_BASE_URL } from "./api";

async function authenticatedPaymentRequest(endpoint, accessToken, body) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/payments/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Unable to connect. Please check that the service is available.");
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid payment response.");
  }

  if (!response.ok) {
    const error = new Error(result.error || `Payment request failed (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }

  if (!result.data || typeof result.data !== "object" || Array.isArray(result.data)) {
    throw new Error("The server returned payment data in an unexpected format.");
  }

  return result.data;
}

export function createPaymentOrder(accessToken, checkoutDetails) {
  return authenticatedPaymentRequest("orders", accessToken, checkoutDetails);
}

export function verifyPayment(accessToken, paymentDetails) {
  return authenticatedPaymentRequest("verify", accessToken, paymentDetails);
}
