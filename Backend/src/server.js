const app = require("./app");
const { port, googleSheetsUrl } = require("./config/env");

if (!googleSheetsUrl) {
  console.warn("Google Sheets sync is disabled. Set GOOGLE_SHEETS_WEB_APP_URL to enable it.");
}

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});