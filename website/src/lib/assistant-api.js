import { API_BASE_URL } from "../services/api";

async function assistantRequest(accessToken, path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/assistant/${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
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

  return result;
}

export async function sendAssistantMessage(
  accessToken,
  message,
  conversationId,
  { voiceMode = false } = {},
) {
  const result = await assistantRequest(accessToken, "chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      ...(voiceMode ? { voiceMode: true } : {}),
      ...(conversationId ? { conversationId } : {}),
    }),
  });

  const responseConversationId = result.data?.conversationId;
  if (
    typeof result.data?.reply !== "string" ||
    !result.data.reply.trim() ||
    (responseConversationId != null &&
      (typeof responseConversationId !== "string" || !responseConversationId.trim()))
  ) {
    throw new Error("ORVEXA returned an invalid chat response. Please try again.");
  }

  return {
    reply: result.data.reply,
    conversationId: responseConversationId || null,
  };
}

export async function listAssistantConversations(accessToken) {
  let result;
  try {
    result = await assistantRequest(accessToken, "conversations");
  } catch (error) {
    if (error.status === 404) {
      throw new Error(
        "Saved chat history is unavailable until the latest backend version is deployed.",
      );
    }
    throw error;
  }

  if (!Array.isArray(result.data?.conversations)) {
    throw new Error("ORVEXA returned an invalid conversation list.");
  }
  return result.data.conversations;
}

export async function getAssistantConversationMessages(accessToken, conversationId) {
  const result = await assistantRequest(
    accessToken,
    `conversations/${encodeURIComponent(conversationId)}/messages`,
  );
  if (!Array.isArray(result.data?.messages)) {
    throw new Error("ORVEXA returned invalid conversation messages.");
  }
  return result.data.messages;
}
