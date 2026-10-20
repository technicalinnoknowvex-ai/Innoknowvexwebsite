const assert = require("node:assert/strict");
const test = require("node:test");
const { jobPayload, validateApplication } = require("./careerController");

const job = {
  title: "Frontend Developer",
  department: "Engineering",
  location: "Bengaluru / Remote",
  employmentType: "Full-time",
  description: "Build accessible, reliable website experiences.",
  requirements: "React experience\nGood communication",
  applicationDeadline: "2026-12-31",
  status: "published",
};

const application = {
  jobId: "2a719d42-bd9b-4aa3-8c0e-b23e6228cd7d",
  fullName: "Aarav Sharma",
  email: "AARAV@example.com",
  phone: "+91 98765 43210",
  resumeUrl: "https://example.com/resume.pdf",
  linkedinUrl: "https://linkedin.com/in/aarav",
  message: "I would like to apply.",
  contactConsent: true,
};

test("normalizes valid job posting fields for storage", () => {
  assert.deepEqual(jobPayload({ ...job, title: " Frontend Developer " }), {
    title: "Frontend Developer",
    department: "Engineering",
    location: "Bengaluru / Remote",
    employment_type: "Full-time",
    description: "Build accessible, reliable website experiences.",
    requirements: "React experience\nGood communication",
    application_deadline: "2026-12-31",
    status: "published",
  });
});

test("rejects incomplete or invalid job postings", () => {
  assert.throws(() => jobPayload({ ...job, title: "" }), { statusCode: 400 });
  assert.throws(() => jobPayload({ ...job, employmentType: "Unknown" }), { statusCode: 400 });
  assert.throws(() => jobPayload({ ...job, applicationDeadline: "next week" }), { statusCode: 400 });
});

test("validates and normalizes job applications", () => {
  assert.deepEqual(validateApplication(application), {
    job_id: application.jobId,
    full_name: "Aarav Sharma",
    email: "aarav@example.com",
    phone: "+91 98765 43210",
    resume_url: "https://example.com/resume.pdf",
    linkedin_url: "https://linkedin.com/in/aarav",
    message: "I would like to apply.",
    contact_consent: true,
  });
});

test("rejects invalid application details, unsafe URLs, missing consent, and spam", () => {
  for (const overrides of [
    { email: "bad-email" },
    { phone: "123" },
    { resumeUrl: "javascript:alert(1)" },
    { contactConsent: false },
    { website: "spam" },
  ]) {
    assert.throws(() => validateApplication({ ...application, ...overrides }), { statusCode: 400 });
  }
});
