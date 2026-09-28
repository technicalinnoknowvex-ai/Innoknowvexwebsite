const supabase = require("../config/supabaseClient");

function getAccessToken(request) {
  return request.headers.authorization?.replace(/^Bearer\s+/i, "");
}

async function authenticate(request, response, next) {
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return response.status(401).json({ error: "Bearer token is required." });
  }

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return response.status(401).json({ error: "Invalid or expired access token." });
  }

  request.user = data.user;
  request.accessToken = accessToken;
  return next();
}

function authorize(...allowedRoles) {
  const normalizedRoles = allowedRoles.map((role) => role.toLowerCase());

  return function authorizeRequest(request, response, next) {
    const role = request.user?.app_metadata?.role;
    const userRole = typeof role === "string" ? role.toLowerCase() : undefined;

    if (!userRole || !normalizedRoles.includes(userRole)) {
      return response.status(403).json({
        error: "You do not have permission to access this resource.",
      });
    }

    return next();
  };
}

function adminOnly(request, response, next) {
  return authorize("admin")(request, response, next);
}

module.exports = {
  authenticate,
  authorize,
  adminOnly,
  requireAuth: authenticate,
};