const allowedPartnershipInterests = new Set([
  "Student training programs",
  "Internships and projects",
  "Placement and career support",
  "Institutional collaboration",
  "Other",
]);

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validatePartnershipInquiry(body) {
  if (typeof body?.website === "string" && body.website.trim()) {
    throw httpError(400, "Unable to submit this inquiry.");
  }

  const collegeName =
    typeof body?.collegeName === "string" ? body.collegeName.trim() : "";
  const state = typeof body?.state === "string" ? body.state.trim() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  const officialEmail =
    typeof body?.officialEmail === "string"
      ? body.officialEmail.trim().toLowerCase()
      : "";
  const contactName =
    typeof body?.contactName === "string" ? body.contactName.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const partnershipInterest =
    typeof body?.partnershipInterest === "string"
      ? body.partnershipInterest.trim()
      : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const phoneDigits = phone.replace(/\D/g, "");

  if (collegeName.length < 2 || collegeName.length > 150) {
    throw httpError(400, "Enter the college name (2 to 150 characters).");
  }
  if (!state || state.length > 100) {
    throw httpError(400, "Enter a valid state.");
  }
  if (!city || city.length > 100) {
    throw httpError(400, "Enter a valid city.");
  }
  if (
    officialEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officialEmail)
  ) {
    throw httpError(400, "Enter a valid official college email address.");
  }
  if (contactName.length < 2 || contactName.length > 100) {
    throw httpError(400, "Enter the contact person's name.");
  }
  if (
    phoneDigits.length < 10 ||
    phoneDigits.length > 15 ||
    !/^[+\d\s().-]+$/.test(phone)
  ) {
    throw httpError(400, "Enter a valid phone number with country code if needed.");
  }
  if (!allowedPartnershipInterests.has(partnershipInterest)) {
    throw httpError(400, "Choose a partnership area from the list.");
  }
  if (message.length > 1000) {
    throw httpError(400, "The additional message must be 1000 characters or less.");
  }
  if (body?.contactConsent !== true) {
    throw httpError(400, "Please agree to be contacted about partnerships.");
  }

  return {
    college_name: collegeName,
    state,
    city,
    official_email: officialEmail,
    contact_name: contactName,
    phone,
    partnership_interest: partnershipInterest,
    message: message || null,
    contact_consent: true,
    source_page:
      typeof body.sourcePage === "string" && body.sourcePage.startsWith("/")
        ? body.sourcePage.slice(0, 200)
        : "/About/About",
  };
}

function createPartnershipInquiryController({ supabase }) {
  return async function createPartnershipInquiry(request, response) {
    const inquiry = validatePartnershipInquiry(request.body);
    const { error } = await supabase
      .from("college_partnership_inquiries")
      .insert(inquiry);

    if (error) throw error;
    response.status(201).json({
      message: "Thank you. Our partnerships team will contact you soon.",
    });
  };
}

module.exports = {
  createPartnershipInquiryController,
  validatePartnershipInquiry,
};
