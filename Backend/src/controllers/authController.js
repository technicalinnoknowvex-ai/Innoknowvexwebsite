const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabaseClient");
const { frontendUrl, supabaseUrl, supabaseAnonKey } = require("../config/env");
const {
  requireEmailAndPassword,
  requireFullName,
  requireRegistration,
  requireEmail,
  requirePassword,
  requireStudentPortfolio,
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

async function updateAuthenticatedUser(accessToken, updates) {
  let response;
  try {
    response = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
  } catch {
    const error = new Error("Unable to connect to Supabase Auth.");
    error.statusCode = 502;
    throw error;
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      result.msg || result.message || result.error_description || "Unable to update your account.",
    );
    error.statusCode = response.status;
    if (result.code) error.code = result.code;
    throw error;
  }

  return result;
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
  const user = await updateAuthenticatedUser(accessTokenFromRequest(request), {
    data: { full_name: fullName },
  });
  response.json({ data: user, message: "Profile updated." });
}

async function getStudentPortfolio(request, response) {
  const authenticatedSupabase = createAuthenticatedClient(accessTokenFromRequest(request));
  const { data, error } = await authenticatedSupabase
    .from("user_profiles_new")
    .select("skills, projects")
    .eq("id", request.user.id)
    .maybeSingle();

  if (error) throw error;
  response.json({
    data: {
      skills: data?.skills || [],
      projects: data?.projects || [],
    },
  });
}

async function updateStudentPortfolio(request, response) {
  const { skills, projects } = requireStudentPortfolio(request);
  const authenticatedSupabase = createAuthenticatedClient(accessTokenFromRequest(request));
  const { data, error } = await authenticatedSupabase
    .from("user_profiles_new")
    .update({ skills, projects })
    .eq("id", request.user.id)
    .select("skills, projects")
    .single();

  if (error) throw error;
  response.json({
    data: {
      skills: data.skills,
      projects: data.projects,
    },
    message: "Student portfolio updated.",
  });
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
  const user = await updateAuthenticatedUser(accessTokenFromRequest(request), { password });
  response.json({ data: user });
}

module.exports = {
  register,
  login,
  logout,
  currentUser,
  updateProfile,
  getStudentPortfolio,
  updateStudentPortfolio,
  forgotPassword,
  resetPassword,
};