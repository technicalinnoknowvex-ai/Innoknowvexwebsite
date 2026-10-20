const technicalErrorPattern =
  /\b(?:supabase|postgrest|postgres(?:ql)?|sqlstate|pgrst\d+|http\s?\d{3}|stack trace|column .+ does not exist|relation .+ does not exist|violates .+ constraint|duplicate key|permission denied|row.level security|jwt|service.role|app_metadata|fetch failed|econn(?:refused|reset)|enotfound|timeout|networkerror|typeerror|referenceerror|syntaxerror|internal server error|unexpected token|cannot read properties|backend|endpoint|response body|json|schema|database|server returned|unexpected format)\b/i;

export function userFacingError(error, fallback) {
  const message =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : "";

  if (!message || technicalErrorPattern.test(message)) return fallback;

  if (/invalid login credentials/i.test(message)) {
    return "The email or password is incorrect. Check your details and try again.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Please verify your email address before signing in.";
  }
  if (/user already registered|already exists/i.test(message)) {
    return "An account with this email already exists. Try signing in instead.";
  }

  return message;
}
