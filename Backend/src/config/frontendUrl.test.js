const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveFrontendUrl } = require("./frontendUrl");

test("uses the production frontend when no frontend URL is configured", () => {
  assert.equal(
    resolveFrontendUrl(undefined, { nodeEnv: "production", isRender: true }),
    "https://www.innoknowvex.in",
  );
});

test("replaces a loopback frontend URL in a hosted runtime", () => {
  for (const configuredUrl of [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://[::1]:3000",
  ]) {
    assert.equal(
      resolveFrontendUrl(configuredUrl, { nodeEnv: "production", isRender: true }),
      "https://www.innoknowvex.in",
    );
  }
});

test("preserves a non-loopback frontend URL", () => {
  assert.equal(
    resolveFrontendUrl("https://staging.innoknowvex.in/", {
      nodeEnv: "production",
      isRender: true,
    }),
    "https://staging.innoknowvex.in",
  );
});

test("preserves localhost for local development", () => {
  assert.equal(
    resolveFrontendUrl("http://localhost:3000", {
      nodeEnv: "development",
      isRender: false,
    }),
    "http://localhost:3000",
  );
});

test("rejects a malformed frontend URL", () => {
  assert.throws(
    () => resolveFrontendUrl("innoknowvex.in", { nodeEnv: "production", isRender: true }),
    /FRONTEND_URL must be a valid absolute URL/,
  );
});
