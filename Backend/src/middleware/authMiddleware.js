const supabase = require("../config/supabaseClient");

function getAccessToken(request) {
  return request.headers.authorization?.replace(/^Bearer\s+/i, "");
}

async function requireAuth(request, response, next) {
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

module.exports = { requireAuth };