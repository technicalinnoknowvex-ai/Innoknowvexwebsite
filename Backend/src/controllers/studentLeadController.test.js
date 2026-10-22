const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createStudentLeadController,
  validateStudentLead,
} = require("./studentLeadController");

const validLead = {
  fullName: "Aarav Sharma",
  email: "AARAV@example.com",
  phone: "+91 98765 43210",
  trainingInterest: "AI & Data Science",
  preferredLanguage: "Hindi",
  contactConsent: true,
  sourcePage: "/programs",
};

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("validates and normalizes student lead contact details", () => {
  assert.deepEqual(validateStudentLead(validLead), {
    full_name: "Aarav Sharma",
    email: "aarav@example.com",
    phone: "+91 98765 43210",
    training_interest: "AI & Data Science",
    preferred_language: "Hindi",
    contact_consent: true,
    source_page: "/programs",
  });
});

test("rejects invalid contact details and missing consent", () => {
  for (const overrides of [
    { email: "not-an-email" },
    { phone: "1234" },
    { trainingInterest: "Unlisted program" },
    { preferredLanguage: "Unlisted language" },
    { contactConsent: false },
  ]) {
    assert.throws(() => validateStudentLead({ ...validLead, ...overrides }), {
      statusCode: 400,
    });
  }
});

test("rejects honeypot submissions", () => {
  assert.throws(() => validateStudentLead({ ...validLead, website: "spam" }), {
    statusCode: 400,
  });
});

test("stores a validated lead and returns a created response", async () => {
  let inserted;
  let synced;
  const controller = createStudentLeadController({
    async syncSubmission(submission) {
      synced = submission;
      return false;
    },
    supabase: {
      from(table) {
        assert.equal(table, "student_guidance_leads");
        return {
          async insert(value) {
            inserted = value;
            return { error: null };
          },
        };
      },
    },
  });
  const response = createResponse();

  await controller({ body: validLead }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(inserted.email, "aarav@example.com");
  assert.equal(inserted.training_interest, "AI & Data Science");
  assert.equal(synced.type, "guidance");
  assert.equal(synced.data.email, "aarav@example.com");
  assert.equal(response.body.message, "Thank you. A counselor will contact you soon.");
});

test("surfaces database errors instead of reporting a successful submission", async () => {
  const databaseError = new Error("Insert failed");
  const controller = createStudentLeadController({
    supabase: {
      from() {
        return { insert: async () => ({ error: databaseError }) };
      },
    },
  });

  await assert.rejects(
    controller({ body: validLead }, createResponse()),
    databaseError,
  );
});
