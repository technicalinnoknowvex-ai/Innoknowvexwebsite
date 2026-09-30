const express = require("express");
const cors = require("cors");
const { frontendUrl } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const programRoutes = require("./routes/programRoutes");
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
app.use("/api", testimonialRoutes);
app.use("/api", partnerRoutes);
app.use("/api", blogRoutes);

app.use((error, request, response, next) => {
  console.error("Request failed:", {
    method: request.method,
    path: request.path,
    message: error.message,
    code: error.code,
    status: error.status,
    stack: error.stack,
  });

  const statusCode = error.statusCode || error.status || (error.code === "LIMIT_FILE_SIZE" ? 400 : 500);
  response.status(statusCode).json({
    error: statusCode >= 500 ? "Internal server error." : error.message,
    ...(statusCode < 500 && error.code ? { code: error.code } : {}),
  });
});

module.exports = app;