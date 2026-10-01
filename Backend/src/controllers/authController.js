const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabaseClient");
const { frontendUrl, supabaseUrl, supabaseAnonKey } = require("../config/env");
const {
  requireEmailAndPassword,
  requireFullName,
  requireRegistration,
  requireEmail,
  requirePassword,
} = require("../validations/authValidation");

function accessTokenFromRequest(request) {
  return request.headers.authorization?.replace(/^Bearer\s+/i, "");
}

function createAuthenticatedClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

async function register(request, response) {
  const { fullName, email, password } = requireRegistration(request);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: new URL("/auth/student/login", frontendUrl).toString(),
    },
  });

  if (error) throw error;
  response.status(201).json({ data, message: "SignUp Successfull" });
}

async function login(request, response) {
  const credentials = requireEmailAndPassword(request);
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) throw error;
  response.json({ data ,message:"Login successfull"});
}

async function logout(request, response) {
  const authenticatedSupabase = createAuthenticatedClient(accessTokenFromRequest(request));
  const { error } = await authenticatedSupabase.auth.signOut();

  if (error) throw error;
  response.status(204).send();
}

async function currentUser(request, response) {
  response.json({ data: request.user });
}

async function updateProfile(request, response) {
  const fullName = requireFullName(request);
  const authenticatedSupabase = createAuthenticatedClient(accessTokenFromRequest(request));
  const { data, error } = await authenticatedSupabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (error) throw error;
  response.json({ data: data.user, message: "Profile updated." });
}

async function forgotPassword(request, response) {
  const email = requireEmail(request);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: request.body?.redirectTo || `${frontendUrl}/reset-password`,
  });

  if (error) throw error;
  response.json({ message: "Password reset email sent if the account exists." });
}

async function resetPassword(request, response) {
  const password = requirePassword(request);
  const authenticatedSupabase = createAuthenticatedClient(accessTokenFromRequest(request));
  const { data, error } = await authenticatedSupabase.auth.updateUser({ password });

  if (error) throw error;
  response.json({ data: data.user });
}

module.exports = {
  register,
  login,
  logout,
  currentUser,
  updateProfile,
  forgotPassword,
  resetPassword,
};