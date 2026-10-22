const { randomUUID } = require("node:crypto");
const { googleSheetsUrl } = require("../config/env");

const allowedSubmissionTypes = ["guidance", "partnership", "job_application"];

function createGoogleSheetsSync({
  webhookUrl,
  fetchImpl = fetch,
  logger = console,
  timeoutMs = 10000,
}) {
  return async function syncSubmission({ type, data }) {
    if (!allowedSubmissionTypes.includes(type)) {
      throw new Error(`Unsupported Google Sheets submission type: ${type}`);
    }

    if (!webhookUrl) return false;

    const syncId = randomUUID();

    try {
      const response = await fetchImpl(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syncId,
          type,
          submittedAt: new Date().toISOString(),
          data,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const responseText = await response.text();

      let result;
      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error("Google Sheets returned an invalid response.");
      }

      if (!response.ok || result?.ok !== true) {
        throw new Error(
          typeof result?.error === "string"
            ? result.error
            : `Google Sheets returned HTTP ${response.status}.`,
        );
      }

      return true;
    } catch (error) {
      logger.error("Google Sheets submission sync failed.", {
        syncId,
        type,
        message: error instanceof Error ? error.message : "Unknown sync error.",
      });
      return false;
    }
  };
}

const syncGoogleSheetSubmission = createGoogleSheetsSync({
  webhookUrl: googleSheetsUrl,
});

module.exports = { createGoogleSheetsSync, syncGoogleSheetSubmission };
