const express = require("express");
const cors = require("cors");
const { frontendUrl } = require("./config/env");
const paymentController = require("./controllers/paymentController");
const studentLeadRoutes = require("./routes/studentLeadRoutes");
const authRoutes = require("./routes/authRoutes");
const programRoutes = require("./routes/programRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();

const allowedOrigins = [
  frontendUrl,
  "http://localhost:3000",
  "https://innoknowvexwebsite.vercel.app",
  ...(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
];

function getErrorStatusCode(error, fallback) {
  const statusCode = Number(error.statusCode ?? error.status);
  return Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599
    ? statusCode
    : fallback;
}

app.use(cors({ origin: [...new Set(allowedOrigins)] }));
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json", limit: "100kb" }),
  paymentController.handleWebhook,
);
app.use(express.json());

app.get("/health", (request, response) => {
  response.json({ status: "ok", message:"Running successfully" });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", studentLeadRoutes);
app.use("/api", programRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", testimonialRoutes);
app.use("/api", partnerRoutes);
app.use("/api", blogRoutes);

app.use((error, request, response, next) => {
  const isPaymentRequest = request.path.startsWith("/api/payments/");
  const providerError = error.error;
  const errorMessage = isPaymentRequest
    ? error.type === "entity.parse.failed"
      ? "Payment request body is invalid."
      : error.type === "entity.too.large"
        ? "Payment request is too large."
        : error.message || "Payment request failed."
    : error.message ||
      providerError?.description ||
      providerError?.reason ||
      "Unexpected server error.";
  const errorCode = isPaymentRequest ? undefined : error.code || providerError?.code;
  const fallbackStatusCode = isPaymentRequest
    ? error.type === "entity.parse.failed"
      ? 400
      : error.type === "entity.too.large"
        ? 413
        : 500
    : errorCode === "LIMIT_FILE_SIZE"
      ? 400
      : 500;
  const statusCode = getErrorStatusCode(error, fallbackStatusCode);
  const responseMessage =
    isPaymentRequest && !error.statusCode && statusCode >= 500
      ? "Payment could not be confirmed. Please try again or contact support if you were charged."
      : errorMessage;

  if (isPaymentRequest) {
    console.error("Payment request failed:", {
      method: request.method,
      path: request.path,
      status: statusCode,
      reason: error.diagnosticCode || "PAYMENT_FAILURE",
    });
  } else {
    console.error("Request failed:", {
      method: request.method,
      path: request.path,
      message: errorMessage,
      code: errorCode,
      status: statusCode,
      stack: error.stack,
    });
  }

  response.status(statusCode).json({
    error:
      statusCode >= 500 && !isPaymentRequest
        ? "Internal server error."
        : responseMessage,
    ...(statusCode < 500 && errorCode ? { code: errorCode } : {}),
  });
});

module.exports = app;