const assert = require("node:assert/strict");
const test = require("node:test");
const { createGoogleSheetsSync } = require("./googleSheetsSync");

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(payload);
    },
  };
}

test("sends a configured submission to Apps Script and accepts its acknowledgement", async () => {
  let request;
  const logged = [];
  const syncSubmission = createGoogleSheetsSync({
    webhookUrl: "https://script.google.com/macros/s/sheets-router/exec",
    fetchImpl: async (url, options) => {
      request = { url, options, body: JSON.parse(options.body) };
      return jsonResponse({ ok: true });
    },
    logger: {
      error() {},
      info(message, details) {
        logged.push({ message, details });
      },
    },
  });
  assert.equal(
    await syncSubmission({
      type: "guidance",
      data: { email: "student@example.com" },
    }),
    true,
  );
  assert.equal(request.url, "https://script.google.com/macros/s/sheets-router/exec");
  assert.equal("secret" in request.body, false);
  assert.equal(request.body.type, "guidance");
  assert.equal(request.body.data.email, "student@example.com");
  assert.match(request.body.syncId, /^[0-9a-f-]{36}$/i);
  assert.ok(request.body.submittedAt);
  assert.equal(logged[0].message, "Google Sheets submission synced.");
  assert.equal(logged[0].details.type, "guidance");
  assert.equal(logged[0].details.syncId, request.body.syncId);
});

test("logs Sheets failures and returns false without throwing", async () => {
  const logged = [];
  const syncSubmission = createGoogleSheetsSync({
    webhookUrl: "https://script.google.com/macros/s/sheets-router/exec",
    fetchImpl: async () => {
      throw new Error("network unavailable");
    },
    logger: {
      error(message, details) {
        logged.push({ message, details });
      },
    },
  });

  assert.equal(
    await syncSubmission({ type: "partnership", data: { city: "Bengaluru" } }),
    false,
  );
  assert.equal(logged.length, 1);
  assert.equal(logged[0].message, "Google Sheets submission sync failed.");
  assert.equal(logged[0].details.type, "partnership");
  assert.equal(logged[0].details.message, "network unavailable");
});

test("treats Apps Script negative acknowledgements as sync failures", async () => {
  const logged = [];
  const syncSubmission = createGoogleSheetsSync({
    webhookUrl: "https://script.google.com/macros/s/sheets-router/exec",
    fetchImpl: async () => jsonResponse({ ok: false, error: "Missing tab." }),
    logger: {
      error(message, details) {
        logged.push(details);
      },
    },
  });

  assert.equal(
    await syncSubmission({ type: "job_application", data: {} }),
    false,
  );
  assert.equal(logged[0].message, "Missing tab.");
});

test("does not make requests when sync is unconfigured", async () => {
  let requested = false;
  const syncSubmission = createGoogleSheetsSync({
    fetchImpl: async () => {
      requested = true;
    },
    logger: { error() {} },
  });

  assert.equal(await syncSubmission({ type: "guidance", data: {} }), false);
  assert.equal(requested, false);
});

test("routes all submission types to the same deployment URL", async () => {
  const requests = [];
  const syncSubmission = createGoogleSheetsSync({
    webhookUrl: "https://script.google.com/macros/s/sheets-router/exec",
    fetchImpl: async (url, options) => {
      requests.push({ url, type: JSON.parse(options.body).type });
      return jsonResponse({ ok: true });
    },
    logger: { error() {} },
  });

  for (const type of ["guidance", "partnership", "job_application"]) {
    assert.equal(await syncSubmission({ type, data: {} }), true);
  }
  assert.deepEqual(requests, [
    { url: "https://script.google.com/macros/s/sheets-router/exec", type: "guidance" },
    { url: "https://script.google.com/macros/s/sheets-router/exec", type: "partnership" },
    { url: "https://script.google.com/macros/s/sheets-router/exec", type: "job_application" },
  ]);
});

test("rejects unsupported submission types", async () => {
  const syncSubmission = createGoogleSheetsSync({
    logger: { error() {} },
  });

  await assert.rejects(
    syncSubmission({ type: "unexpected", data: {} }),
    /Unsupported Google Sheets submission type/,
  );
});
