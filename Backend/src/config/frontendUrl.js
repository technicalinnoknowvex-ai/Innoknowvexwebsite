const PRODUCTION_FRONTEND_URL = "https://www.innoknowvex.in";

function resolveFrontendUrl(configuredUrl, { nodeEnv, isRender }) {
  if (!configuredUrl) return PRODUCTION_FRONTEND_URL;

  let parsedUrl;
  try {
    parsedUrl = new URL(configuredUrl);
  } catch {
    throw new Error("FRONTEND_URL must be a valid absolute URL.");
  }

  const isLoopbackHost =
    parsedUrl.hostname === "localhost" ||
    parsedUrl.hostname === "[::1]" ||
    /^127(?:\.\d{1,3}){3}$/.test(parsedUrl.hostname);
  const isHostedRuntime = nodeEnv === "production" || isRender;

  return isHostedRuntime && isLoopbackHost
    ? PRODUCTION_FRONTEND_URL
    : configuredUrl.replace(/\/+$/, "");
}

module.exports = { resolveFrontendUrl };
