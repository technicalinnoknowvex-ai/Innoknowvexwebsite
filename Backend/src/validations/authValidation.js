function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function requireEmailAndPassword(request) {
  const { email, password } = request.body || {};

  if (typeof email !== "string" || !email.trim()) {
    throw validationError("A valid email is required.");
  }

  if (typeof password !== "string" || password.length < 6) {
    throw validationError("Password must be at least 6 characters.");
  }

  return { email: email.trim().toLowerCase(), password };
}

function requireFullName(request) {
  const { fullName } = request.body || {};

  if (typeof fullName !== "string" || !fullName.trim()) {
    throw validationError("Full name is required.");
  }

  if (fullName.trim().length > 120) {
    throw validationError("Full name must be 120 characters or fewer.");
  }

  return fullName.trim();
}

function requireRegistration(request) {
  const { email, password, confirmPassword } = request.body || {};
  const fullName = requireFullName(request);

  const credentials = requireEmailAndPassword(request);

  if (typeof confirmPassword !== "string" || !confirmPassword) {
    throw validationError("Confirm password is required.");
  }

  if (credentials.password !== confirmPassword) {
    throw validationError("Password and confirm password must match.");
  }

  return {
    ...credentials,
    fullName: fullName.trim(),
  };
}

function requireEmail(request) {
  const { email } = request.body || {};

  if (typeof email !== "string" || !email.trim()) {
    throw validationError("A valid email is required.");
  }

  return email.trim().toLowerCase();
}

function requirePassword(request) {
  const { password } = request.body || {};

  if (typeof password !== "string" || password.length < 6) {
    throw validationError("Password must be at least 6 characters.");
  }

  return password;
}

module.exports = {
  requireEmailAndPassword,
  requireFullName,
  requireRegistration,
  requireEmail,
  requirePassword,
};