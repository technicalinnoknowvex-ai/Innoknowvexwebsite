require("dotenv").config();
const { resolveFrontendUrl } = require("./frontendUrl");

const requiredEnvironmentVariables = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];

for (const variableName of requiredEnvironmentVariables) {
  if (!process.env[variableName]) {
    throw new Error(`Missing required environment variable: ${variableName}`);
  }
}

module.exports = {
  port: Number(process.env.PORT || 5000),
  frontendUrl: resolveFrontendUrl(process.env.FRONTEND_URL, {
    nodeEnv: process.env.NODE_ENV,
    isRender: process.env.RENDER === "true",
  }),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  googleSheetsUrl: process.env.GOOGLE_SHEETS_WEB_APP_URL,
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
};