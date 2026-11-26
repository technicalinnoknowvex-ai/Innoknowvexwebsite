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
  const isAdminSignup = request.body?.redirectTo === "/auth/admin/login";
  const emailRedirectUrl = new URL(
    isAdminSignup ? "/auth/admin/login" : "/auth/student/login",
    frontendUrl,
  );
  const postVerificationPath = request.body?.redirectTo;
  if (
    !isAdminSignup &&
    typeof postVerificationPath === "string" &&
    postVerificationPath.startsWith("/") &&
    !postVerificationPath.startsWith("//") &&
    !postVerificationPath.includes("\\")
  ) {
    emailRedirectUrl.searchParams.set("next", postVerificationPath);
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: emailRedirectUrl.toString(),
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
    .select(
      "skills, learning_skills, projects, current_status, education_level, experience, interests, goals, ai_personalization_consent, ai_personalization_consent_provider, onboarding_completed",
    )
    .eq("id", request.user.id)
    .maybeSingle();

  if (error) throw error;
  response.json({
    data: {
      skills: data?.skills || [],
      learning_skills: data?.learning_skills || [],
      projects: data?.projects || [],
      current_status: data?.current_status || null,
      education_level: data?.education_level || null,
      experience: data?.experience || [],
      interests: data?.interests || [],
      goals: data?.goals || [],
      ai_personalization_consent: data?.ai_personalization_consent ?? false,
      ai_personalization_consent_provider: data?.ai_personalization_consent_provider || null,
      onboarding_completed: data?.onboarding_completed ?? false,
    },
  });
}

async function updateStudentPortfolio(request, response) {
  const profile = requireStudentPortfolio(request);
  const authenticatedSupabase = createAuthenticatedClient(accessTokenFromRequest(request));
  const isConsentWithdrawal =
    profile.ai_personalization_consent === false &&
    profile.onboarding_completed === true &&
    Object.keys(profile).length === 3;
  const profileQuery = isConsentWithdrawal
    ? authenticatedSupabase
        .from("user_profiles_new")
        .update(profile)
        .eq("id", request.user.id)
    : authenticatedSupabase
        .from("user_profiles_new")
        .upsert(
          {
            id: request.user.id,
            full_name:
              request.user.user_metadata?.full_name ||
              request.user.email?.split("@")[0] ||
              "Student",
            email: request.user.email,
            ...profile,
          },
          { onConflict: "id" },
        );
  const { data, error } = await profileQuery.select(
    "skills, learning_skills, projects, current_status, education_level, experience, interests, goals, ai_personalization_consent, ai_personalization_consent_provider, onboarding_completed",
  ).single();

  if (error) throw error;
  response.json({
    data: {
      skills: data.skills || [],
      learning_skills: data.learning_skills || [],
      projects: data.projects || [],
      current_status: data.current_status || null,
      education_level: data.education_level || null,
      experience: data.experience || [],
      interests: data.interests || [],
      goals: data.goals || [],
      ai_personalization_consent: data.ai_personalization_consent ?? false,
      ai_personalization_consent_provider: data.ai_personalization_consent_provider || null,
      onboarding_completed: data.onboarding_completed ?? false,
    },
    message: "Learner profile updated.",
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