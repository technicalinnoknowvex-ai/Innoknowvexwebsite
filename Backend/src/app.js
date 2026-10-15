const express = require("express");
const cors = require("cors");
const { frontendUrl } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const programRoutes = require("./routes/programRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get("/health", (request, response) => {
  response.json({ status: "ok", message:"Running successfully" });
});

app.use("/api/auth", authRoutes);
app.use("/api", programRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", testimonialRoutes);
app.use("/api", partnerRoutes);
app.use("/api", blogRoutes);

app.use((error, request, response, next) => {
  const providerError = error.error;
  const errorMessage =
    error.message ||
    providerError?.description ||
    providerError?.reason ||
    "Unexpected server error.";
  const errorCode = error.code || providerError?.code;
  const statusCode =
    error.statusCode ||
    error.status ||
    (errorCode === "LIMIT_FILE_SIZE" ? 400 : 500);

  console.error("Request failed:", {
    method: request.method,
    path: request.path,
    message: errorMessage,
    code: errorCode,
    status: statusCode,
    stack: error.stack,
  });

  response.status(statusCode).json({
    error: statusCode >= 500 ? "Internal server error." : errorMessage,
    ...(statusCode < 500 && errorCode ? { code: errorCode } : {}),
  });
});

module.exports = app;