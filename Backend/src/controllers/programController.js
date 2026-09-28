const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabaseClient");
const { supabaseUrl, supabaseAnonKey } = require("../config/env");

const programFields = [
  "title",
  "slug",
  "category",
  "short_description",
  "image_url",
  "brochure_url",
  "status",
  "featured",
  "internship",
];

function createAuthenticatedClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function requestClient(request) {
  return createAuthenticatedClient(request.accessToken);
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toProgram(row) {
  if (!row) return row;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category,
    shortDescription: row.short_description,
    imageUrl: row.image_url,
    brochureUrl: row.brochure_url,
    status: row.status,
    featured: row.featured,
    internship: row.internship,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function programPayload(body, partial = false) {
  const payload = {};
  const aliases = {
    shortDescription: "short_description",
    imageUrl: "image_url",
    brochureUrl: "brochure_url",
  };

  for (const field of programFields) {
    const camelField = Object.keys(aliases).find((key) => aliases[key] === field) || field;
    const value = body?.[camelField] ?? body?.[field];
    if (value !== undefined) payload[field] = value;
  }

  if (!partial) {
    if (typeof payload.title !== "string" || !payload.title.trim()) {
      throw httpError(400, "Program title is required.");
    }
    if (typeof payload.slug !== "string" || !payload.slug.trim()) {
      throw httpError(400, "Program slug is required.");
    }
    if (typeof payload.category !== "string" || !payload.category.trim()) {
      throw httpError(400, "Program category is required.");
    }
  }

  if (payload.slug) payload.slug = payload.slug.trim().toLowerCase();
  if (payload.title) payload.title = payload.title.trim();
  if (payload.category) payload.category = payload.category.trim();

  return payload;
}

async function createProgram(request, response) {
  const { data, error } = await requestClient(request)
    .from("programs_new")
    .insert(programPayload(request.body))
    .select()
    .single();

  if (error) throw error;
  response.status(201).json({ data: toProgram(data) });
}

async function listAdminPrograms(request, response) {
  const { data, error } = await requestClient(request)
    .from("programs_new")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  response.json({ data: data.map(toProgram) });
}

async function getAdminProgram(request, response) {
  const { data, error } = await requestClient(request)
    .from("programs_new")
    .select()
    .eq("id", request.params.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Program not found.");
  response.json({ data: toProgram(data) });
}

async function updateProgram(request, response) {
  const { data, error } = await requestClient(request)
    .from("programs_new")
    .update({ ...programPayload(request.body, true), updated_at: new Date().toISOString() })
    .eq("id", request.params.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Program not found.");
  response.json({ data: toProgram(data) });
}

async function deleteProgram(request, response) {
  const { data, error } = await requestClient(request)
    .from("programs_new")
    .delete()
    .eq("id", request.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Program not found.");
  response.status(204).send();
}

async function listPublicPrograms(request, response) {
  const { data, error } = await supabase
    .from("programs_new")
    .select()
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;
  response.json({ data: data.map(toProgram) });
}

async function getPublicProgram(request, response) {
  const { data, error } = await supabase
    .from("programs_new")
    .select()
    .eq("slug", request.params.slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Published program not found.");
  response.json({ data: toProgram(data) });
}

module.exports = {
  createProgram,
  listAdminPrograms,
  getAdminProgram,
  updateProgram,
  deleteProgram,
  listPublicPrograms,
  getPublicProgram,
};