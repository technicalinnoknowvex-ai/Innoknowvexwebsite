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
  const { skills, projects } = request.body || {};

  if (!Array.isArray(skills) || skills.length > 30) {
    throw validationError("Skills must be a list containing no more than 30 items.");
  }

  const normalizedSkills = skills.map((skill) => {
    if (typeof skill !== "string" || !skill.trim() || skill.trim().length > 100) {
      throw validationError("Each skill must contain 1 to 100 characters.");
    }
    return skill.trim();
  });

  if (new Set(normalizedSkills.map((skill) => skill.toLowerCase())).size !== normalizedSkills.length) {
    throw validationError("Skills cannot contain duplicates.");
  }

  if (!Array.isArray(projects) || projects.length > 20) {
    throw validationError("Projects must be a list containing no more than 20 items.");
  }

  const normalizedProjects = projects.map((project) => {
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

  return { skills: normalizedSkills, projects: normalizedProjects };
}

module.exports = {
  requireEmailAndPassword,
  requireFullName,
  requireRegistration,
  requireEmail,
  requirePassword,
  requireStudentPortfolio,
};