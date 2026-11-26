import assert from "node:assert/strict";
import test from "node:test";
import { sendAssistantMessage } from "../src/lib/assistant-api.js";

test("preserves separately generated speech fields for voice requests", async () => {
  const originalFetch = globalThis.fetch;
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return {
      ok: true,
      json: async () => ({
        data: {
          reply: "A formatted chat answer.",
          conversationId: "conversation-id",
          spokenReply: "A natural spoken answer.",
          spokenReplyError: "A prior optional error.",
        },
      }),
    };
  };

  try {
    const result = await sendAssistantMessage(
      "token",
      "Ask a question",
      null,
      { voiceMode: true },
    );

    assert.equal(requestBody.voiceMode, true);
    assert.deepEqual(result, {
      reply: "A formatted chat answer.",
      conversationId: "conversation-id",
      spokenReply: "A natural spoken answer.",
      spokenReplyError: "A prior optional error.",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("keeps text chat responses unchanged when speech fields are present", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    assert.equal(JSON.parse(options.body).voiceMode, undefined);
    return {
      ok: true,
      json: async () => ({
        data: {
          reply: "A formatted chat answer.",
          conversationId: "conversation-id",
          spokenReply: "A natural spoken answer.",
        },
      }),
    };
  };

  try {
    const result = await sendAssistantMessage("token", "Ask a question", null);
    assert.deepEqual(result, {
      reply: "A formatted chat answer.",
      conversationId: "conversation-id",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
