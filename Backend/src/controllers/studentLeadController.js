const { syncGoogleSheetSubmission } = require("../services/googleSheetsSync");

const allowedTrainingInterests = new Set([
  "AI & Data Science",
  "Web Development",
  "Cybersecurity",
  "Digital Marketing",
  "Business & Finance",
  "Other",
]);

const allowedLanguages = new Set(["English", "Hindi", "Telugu", "Other"]);

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateStudentLead(body) {
  if (typeof body?.website === "string" && body.website.trim()) {
    throw httpError(400, "Unable to submit this request.");
  }

  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const trainingInterest =
    typeof body?.trainingInterest === "string" ? body.trainingInterest.trim() : "";
  const preferredLanguage =
    typeof body?.preferredLanguage === "string" ? body.preferredLanguage.trim() : "";
  const phoneDigits = phone.replace(/\D/g, "");

  if (fullName.length < 2 || fullName.length > 100) {
    throw httpError(400, "Enter your name (2 to 100 characters).");
  }
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw httpError(400, "Enter a valid email address.");
  }
  if (phoneDigits.length < 10 || phoneDigits.length > 15 || !/^[+\d\s().-]+$/.test(phone)) {
    throw httpError(400, "Enter a valid phone number with country code if needed.");
  }
  if (!allowedTrainingInterests.has(trainingInterest)) {
    throw httpError(400, "Choose a training area from the list.");
  }
  if (!allowedLanguages.has(preferredLanguage)) {
    throw httpError(400, "Choose a preferred language from the list.");
  }
  if (body?.contactConsent !== true) {
    throw httpError(400, "Please agree to be contacted by a counselor.");
  }

  return {
    full_name: fullName,
    email,
    phone,
    training_interest: trainingInterest,
    preferred_language: preferredLanguage,
    contact_consent: true,
    source_page:
      typeof body.sourcePage === "string" && body.sourcePage.startsWith("/")
        ? body.sourcePage.slice(0, 200)
        : "/",
  };
}

function createStudentLeadController({
  supabase,
  syncSubmission = syncGoogleSheetSubmission,
}) {
  return async function createStudentLead(request, response) {
    const lead = validateStudentLead(request.body);
    const { error } = await supabase.from("student_guidance_leads").insert(lead);

    if (error) throw error;
    await syncSubmission({ type: "guidance", data: lead });
    response.status(201).json({
      message: "Thank you. A counselor will contact you soon.",
    });
  };
}

module.exports = {
  createStudentLeadController,
  validateStudentLead,
};
