const assert = require("node:assert/strict");
const test = require("node:test");
const { requireStudentPortfolio } = require("./authValidation");

function request(body) {
  return { body };
}

test("validates and normalizes learner profile fields", () => {
  assert.deepEqual(
    requireStudentPortfolio(
      request({
        skills: ["JavaScript", "React"],
        learning_skills: ["Machine learning"],
        current_status: "Working Professional",
        education_level: " Bachelor's degree ",
        experience: [
          {
            role: "Developer",
            organization: "Example Co.",
            description: "Built an internal dashboard.",
            startDate: "2023",
            endDate: "2025",
          },
        ],
        interests: ["AI", "Web development"],
        goals: ["Build AI applications"],
        ai_personalization_consent: true,
        onboarding_completed: true,
      }),
    ),
    {
      skills: ["JavaScript", "React"],
      learning_skills: ["Machine learning"],
      current_status: "working_professional",
      education_level: "Bachelor's degree",
      experience: [
        {
          role: "Developer",
          organization: "Example Co.",
          description: "Built an internal dashboard.",
          startDate: "2023",
          endDate: "2025",
        },
      ],
      interests: ["AI", "Web development"],
      goals: ["Build AI applications"],
      ai_personalization_consent: true,
      onboarding_completed: true,
    },
  );
});

test("allows partial profile updates and clearing optional collections", () => {
  assert.deepEqual(
    requireStudentPortfolio(
      request({
        skills: [],
        learning_skills: [],
        experience: [],
        interests: [],
        goals: [],
        current_status: null,
        education_level: null,
        ai_personalization_consent: false,
      }),
    ),
    {
      skills: [],
      learning_skills: [],
      experience: [],
      interests: [],
      goals: [],
      current_status: null,
      education_level: null,
      ai_personalization_consent: false,
    },
  );
});

test("rejects empty requests and unsupported profile fields", () => {
  assert.throws(() => requireStudentPortfolio(request({})), { statusCode: 400 });
  assert.throws(
    () => requireStudentPortfolio(request({ role: "admin" })),
    { statusCode: 400 },
  );
});

test("rejects invalid learner profile values", () => {
  for (const body of [
    { current_status: "unknown" },
    { education_level: "x".repeat(121) },
    { interests: ["AI", "ai"] },
    { learning_skills: ["Python", "python"] },
    { goals: "Become a developer" },
    { ai_personalization_consent: "yes" },
    { onboarding_completed: 1 },
    { experience: [{ role: "" }] },
    { experience: [{ role: "Developer", organization: "x".repeat(121) }] },
  ]) {
    assert.throws(() => requireStudentPortfolio(request(body)), { statusCode: 400 });
  }
});

test("preserves project validation for existing portfolio clients", () => {
  assert.deepEqual(
    requireStudentPortfolio(
      request({
        projects: [
          {
            title: "Course portal",
            description: "A learning platform.",
            technologies: ["React"],
            url: "https://example.com/project",
          },
        ],
      }),
    ),
    {
      projects: [
        {
          title: "Course portal",
          description: "A learning platform.",
          technologies: ["React"],
          url: "https://example.com/project",
        },
      ],
    },
  );
});
