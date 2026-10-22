const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createPartnershipInquiryController,
  validatePartnershipInquiry,
} = require("./partnershipInquiryController");

const validInquiry = {
  collegeName: "City Institute of Technology",
  state: "Karnataka",
  city: "Bengaluru",
  officialEmail: "PARTNERSHIPS@CITY.EDU",
  contactName: "Ananya Rao",
  phone: "+91 98765 43210",
  partnershipInterest: "Student training programs",
  message: "We would like to discuss training programs for our students.",
  contactConsent: true,
  sourcePage: "/About/About",
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

test("validates and normalizes college partnership inquiries", () => {
  assert.deepEqual(validatePartnershipInquiry(validInquiry), {
    college_name: "City Institute of Technology",
    state: "Karnataka",
    city: "Bengaluru",
    official_email: "partnerships@city.edu",
    contact_name: "Ananya Rao",
    phone: "+91 98765 43210",
    partnership_interest: "Student training programs",
    message: "We would like to discuss training programs for our students.",
    contact_consent: true,
    source_page: "/About/About",
  });
});

test("rejects invalid email, phone, partnership area, consent, or spam", () => {
  for (const overrides of [
    { officialEmail: "invalid" },
    { phone: "555" },
    { partnershipInterest: "Unlisted option" },
    { contactConsent: false },
    { website: "spam" },
  ]) {
    assert.throws(
      () => validatePartnershipInquiry({ ...validInquiry, ...overrides }),
      { statusCode: 400 },
    );
  }
});

test("stores a validated inquiry and returns a created response", async () => {
  let inserted;
  let synced;
  const controller = createPartnershipInquiryController({
    async syncSubmission(submission) {
      synced = submission;
      return false;
    },
    supabase: {
      from(table) {
        assert.equal(table, "college_partnership_inquiries");
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

  await controller({ body: validInquiry }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(inserted.college_name, validInquiry.collegeName);
  assert.equal(inserted.official_email, "partnerships@city.edu");
  assert.equal(synced.type, "partnership");
  assert.equal(synced.data.college_name, validInquiry.collegeName);
  assert.equal(
    response.body.message,
    "Thank you. Our partnerships team will contact you soon.",
  );
});

test("surfaces database errors without returning success", async () => {
  const databaseError = new Error("Insert failed");
  const controller = createPartnershipInquiryController({
    supabase: {
      from() {
        return { insert: async () => ({ error: databaseError }) };
      },
    },
  });

  await assert.rejects(
    controller({ body: validInquiry }, createResponse()),
    databaseError,
  );
});
