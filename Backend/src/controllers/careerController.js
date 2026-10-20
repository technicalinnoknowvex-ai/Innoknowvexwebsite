const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabaseClient");
const { supabaseUrl, supabaseAnonKey } = require("../config/env");

const jobStatuses = new Set(["draft", "published", "archived"]);
const employmentTypes = new Set(["Full-time", "Part-time", "Internship", "Contract"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function authenticatedClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function jobPayload(body, partial = false) {
  const payload = {};
  const fields = {
    title: "title",
    department: "department",
    location: "location",
    employmentType: "employment_type",
    description: "description",
    requirements: "requirements",
    applicationDeadline: "application_deadline",
    status: "status",
  };

  for (const [inputField, databaseField] of Object.entries(fields)) {
    const value = body?.[inputField] ?? body?.[databaseField];
    if (value !== undefined) payload[databaseField] = value;
  }

  for (const [field, minimum, maximum] of [
    ["title", 2, 150],
    ["department", 2, 100],
    ["location", 2, 150],
    ["description", 10, 10000],
    ["requirements", 2, 10000],
  ]) {
    if (payload[field] !== undefined) {
      if (typeof payload[field] !== "string") {
        throw httpError(400, `Job ${field.replace("_", " ")} must be text.`);
      }
      payload[field] = payload[field].trim();
      if (payload[field].length < minimum || payload[field].length > maximum) {
        throw httpError(400, `Job ${field.replace("_", " ")} must be between ${minimum} and ${maximum} characters.`);
      }
    }
  }

  if (!partial) {
    for (const field of ["title", "department", "location", "description", "requirements"]) {
      if (!payload[field]) throw httpError(400, `Job ${field.replace("_", " ")} is required.`);
    }
    if (!employmentTypes.has(payload.employment_type)) {
      throw httpError(400, "Choose a valid employment type.");
    }
    if (!jobStatuses.has(payload.status)) payload.status = "draft";
  }

  if (payload.employment_type && !employmentTypes.has(payload.employment_type)) {
    throw httpError(400, "Choose a valid employment type.");
  }
  if (payload.status && !jobStatuses.has(payload.status)) {
    throw httpError(400, "Choose a valid job status.");
  }

  if (payload.application_deadline === "") payload.application_deadline = null;
  if (payload.application_deadline !== undefined && payload.application_deadline !== null) {
    const dateValue = payload.application_deadline;
    if (
      typeof dateValue !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dateValue) ||
      Number.isNaN(Date.parse(`${dateValue}T00:00:00Z`)) ||
      new Date(`${dateValue}T00:00:00Z`).toISOString().slice(0, 10) !== dateValue
    ) {
      throw httpError(400, "Enter a valid application deadline.");
    }
  }

  return payload;
}

function toJob(row) {
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    location: row.location,
    employmentType: row.employment_type,
    description: row.description,
    requirements: row.requirements,
    applicationDeadline: row.application_deadline,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateApplication(body) {
  if (typeof body?.website === "string" && body.website.trim()) {
    throw httpError(400, "Unable to submit this application.");
  }

  const jobId = typeof body?.jobId === "string" ? body.jobId.trim() : "";
  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const resumeUrl = typeof body?.resumeUrl === "string" ? body.resumeUrl.trim() : "";
  const linkedinUrl = typeof body?.linkedinUrl === "string" ? body.linkedinUrl.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const phoneDigits = phone.replace(/\D/g, "");

  if (!UUID_PATTERN.test(jobId)) throw httpError(400, "Choose a valid job listing.");
  if (fullName.length < 2 || fullName.length > 100) {
    throw httpError(400, "Enter your name (2 to 100 characters).");
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError(400, "Enter a valid email address.");
  }
  if (phoneDigits.length < 10 || phoneDigits.length > 15 || !/^[+\d\s().-]+$/.test(phone)) {
    throw httpError(400, "Enter a valid phone number with country code if needed.");
  }

  for (const [label, value] of [["Resume", resumeUrl], ["LinkedIn", linkedinUrl]]) {
    if (value) {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
      } catch {
        throw httpError(400, `Enter a valid ${label.toLowerCase()} URL.`);
      }
    }
  }
  if (message.length > 2000) throw httpError(400, "Message must be 2000 characters or less.");
  if (body?.contactConsent !== true) {
    throw httpError(400, "Please agree to be contacted about your application.");
  }

  return {
    job_id: jobId,
    full_name: fullName,
    email,
    phone,
    resume_url: resumeUrl || null,
    linkedin_url: linkedinUrl || null,
    message: message || null,
    contact_consent: true,
  };
}

async function listPublicJobs(request, response) {
  const { data, error } = await supabase
    .from("career_jobs")
    .select()
    .eq("status", "published")
    .or(`application_deadline.is.null,application_deadline.gte.${new Date().toISOString().slice(0, 10)}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  response.json({ data: data.map(toJob) });
}

async function createApplication(request, response) {
  const application = validateApplication(request.body);
  const { data: job, error: jobError } = await supabase
    .from("career_jobs")
    .select("id")
    .eq("id", application.job_id)
    .eq("status", "published")
    .or(`application_deadline.is.null,application_deadline.gte.${new Date().toISOString().slice(0, 10)}`)
    .maybeSingle();

  if (jobError) throw jobError;
  if (!job) throw httpError(404, "This job is no longer accepting applications.");

  const { error } = await supabase.from("career_applications").insert(application);
  if (error) throw error;
  response.status(201).json({ message: "Your application has been submitted successfully." });
}

async function listAdminJobs(request, response) {
  const { data, error } = await authenticatedClient(request.accessToken)
    .from("career_jobs")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  response.json({ data: data.map(toJob) });
}

async function createJob(request, response) {
  const { data, error } = await authenticatedClient(request.accessToken)
    .from("career_jobs")
    .insert(jobPayload(request.body))
    .select()
    .single();

  if (error) throw error;
  response.status(201).json({ data: toJob(data) });
}

async function updateJob(request, response) {
  const payload = jobPayload(request.body, true);
  if (!Object.keys(payload).length) throw httpError(400, "Provide at least one job field to update.");

  const { data, error } = await authenticatedClient(request.accessToken)
    .from("career_jobs")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", request.params.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Job posting not found.");
  response.json({ data: toJob(data) });
}

async function deleteJob(request, response) {
  const { data, error } = await authenticatedClient(request.accessToken)
    .from("career_jobs")
    .delete()
    .eq("id", request.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Job posting not found.");
  response.status(204).send();
}

module.exports = {
  listPublicJobs,
  createApplication,
  listAdminJobs,
  createJob,
  updateJob,
  deleteJob,
  jobPayload,
  validateApplication,
};
