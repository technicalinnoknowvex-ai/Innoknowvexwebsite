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

function requireStudentPortfolio(request) {
  const body = request.body || {};
  const allowedFields = new Set([
    "skills",
    "learning_skills",
    "projects",
    "current_status",
    "education_level",
    "experience",
    "interests",
    "goals",
    "ai_personalization_consent",
    "onboarding_completed",
  ]);
  const fields = Object.keys(body);

  if (!fields.length) {
    throw validationError("At least one learner profile field is required.");
  }
  if (fields.some((field) => !allowedFields.has(field))) {
    throw validationError("The learner profile contains an unsupported field.");
  }

  const profile = {};

  function normalizeStringList(value, fieldName, maxItems, maxLength) {
    if (!Array.isArray(value) || value.length > maxItems) {
      throw validationError(
        `${fieldName} must be a list containing no more than ${maxItems} items.`,
      );
    }

    const normalized = value.map((item) => {
      if (typeof item !== "string" || !item.trim() || item.trim().length > maxLength) {
        throw validationError(
          `Each ${fieldName.toLowerCase()} item must contain 1 to ${maxLength} characters.`,
        );
      }
      return item.trim();
    });

    if (new Set(normalized.map((item) => item.toLowerCase())).size !== normalized.length) {
      throw validationError(`${fieldName} cannot contain duplicates.`);
    }

    return normalized;
  }

  if (Object.hasOwn(body, "skills")) {
    profile.skills = normalizeStringList(body.skills, "Skills", 30, 100);
  }

  if (Object.hasOwn(body, "learning_skills")) {
    profile.learning_skills = normalizeStringList(
      body.learning_skills,
      "Learning skills",
      30,
      100,
    );
  }

  if (Object.hasOwn(body, "projects")) {
    if (!Array.isArray(body.projects) || body.projects.length > 20) {
      throw validationError("Projects must be a list containing no more than 20 items.");
    }

    profile.projects = body.projects.map((project) => {
      if (!project || typeof project !== "object" || Array.isArray(project)) {
        throw validationError("Each project must be an object.");
      }

      const { title, description = "", technologies = [], url = "" } = project;
      if (typeof title !== "string" || !title.trim() || title.trim().length > 120) {
        throw validationError("Each project needs a title of 1 to 120 characters.");
      }
      if (typeof description !== "string" || description.length > 1000) {
        throw validationError("Project descriptions must be 1000 characters or fewer.");
      }
      if (!Array.isArray(technologies) || technologies.length > 20) {
        throw validationError("Each project can have no more than 20 technologies.");
      }

      const normalizedTechnologies = technologies.map((technology) => {
        if (typeof technology !== "string" || !technology.trim() || technology.trim().length > 60) {
          throw validationError("Each technology must contain 1 to 60 characters.");
        }
        return technology.trim();
      });

      if (typeof url !== "string" || url.length > 2048) {
        throw validationError("Project links must be valid HTTP or HTTPS URLs.");
      }
      const normalizedUrl = url.trim();
      if (normalizedUrl) {
        let parsedUrl;
        try {
          parsedUrl = new URL(normalizedUrl);
        } catch {
          throw validationError("Project links must be valid HTTP or HTTPS URLs.");
        }
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw validationError("Project links must be valid HTTP or HTTPS URLs.");
        }
      }

      return {
        title: title.trim(),
        description: description.trim(),
        technologies: normalizedTechnologies,
        url: normalizedUrl,
      };
    });
  }

  if (Object.hasOwn(body, "current_status")) {
    const { current_status: currentStatus } = body;
    if (currentStatus === null || currentStatus === "") {
      profile.current_status = null;
    } else if (typeof currentStatus === "string") {
      const normalizedStatus = currentStatus.trim().toLowerCase().replace(/[\s-]+/g, "_");
      if (!["student", "graduate", "working_professional"].includes(normalizedStatus)) {
        throw validationError(
          "Current status must be student, graduate, or working professional.",
        );
      }
      profile.current_status = normalizedStatus;
    } else {
      throw validationError("Current status must be a string or null.");
    }
  }

  if (Object.hasOwn(body, "education_level")) {
    const educationLevel = body.education_level;
    if (educationLevel === null || educationLevel === "") {
      profile.education_level = null;
    } else if (typeof educationLevel === "string" && educationLevel.trim().length <= 120) {
      profile.education_level = educationLevel.trim();
    } else {
      throw validationError("Education level must be a string of 120 characters or fewer.");
    }
  }

  if (Object.hasOwn(body, "experience")) {
    if (!Array.isArray(body.experience) || body.experience.length > 20) {
      throw validationError("Experience must be a list containing no more than 20 items.");
    }
    profile.experience = body.experience.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw validationError("Each experience item must be an object.");
      }

      const { role, organization = "", description = "", startDate = "", endDate = "" } = item;
      if (typeof role !== "string" || !role.trim() || role.trim().length > 120) {
        throw validationError("Each experience item needs a role of 1 to 120 characters.");
      }
      if (typeof organization !== "string" || organization.length > 120) {
        throw validationError("Experience organization must be 120 characters or fewer.");
      }
      if (typeof description !== "string" || description.length > 1000) {
        throw validationError("Experience descriptions must be 1000 characters or fewer.");
      }
      if (typeof startDate !== "string" || startDate.length > 40) {
        throw validationError("Experience start dates must be 40 characters or fewer.");
      }
      if (typeof endDate !== "string" || endDate.length > 40) {
        throw validationError("Experience end dates must be 40 characters or fewer.");
      }

      return {
        role: role.trim(),
        organization: organization.trim(),
        description: description.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
      };
    });
  }

  for (const field of ["interests", "goals"]) {
    if (Object.hasOwn(body, field)) {
      profile[field] = normalizeStringList(
        body[field],
        field === "interests" ? "Interests" : "Goals",
        30,
        200,
      );
    }
  }

  for (const field of ["ai_personalization_consent", "onboarding_completed"]) {
    if (Object.hasOwn(body, field)) {
      if (typeof body[field] !== "boolean") {
        throw validationError(`${field} must be a boolean.`);
      }
      profile[field] = body[field];
    }
  }

  if (Object.hasOwn(profile, "ai_personalization_consent")) {
    profile.ai_personalization_consent_provider =
      profile.ai_personalization_consent ? "groq" : null;
  }

  return profile;
}

module.exports = {
  requireEmailAndPassword,
  requireFullName,
  requireRegistration,
  requireEmail,
  requirePassword,
  requireStudentPortfolio,
};