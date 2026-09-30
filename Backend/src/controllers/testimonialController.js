const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabaseClient");
const { supabaseUrl, supabaseAnonKey } = require("../config/env");
const { uploadToStorage, assertFileType } = require("../utils/storageUpload");

function createAuthenticatedClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function testimonialPayload(body, partial = false) {
  const payload = {};
  const fields = [
    "name",
    "profile_image",
    "designation",
    "program",
    "rating",
    "content",
    "featured",
    "status",
    "display_order",
  ];
  const aliases = {
    profileImage: "profile_image",
    displayOrder: "display_order",
  };

  for (const field of fields) {
    const apiField = Object.keys(aliases).find((key) => aliases[key] === field) || field;
    const value = body?.[apiField] ?? body?.[field] ?? (field === "display_order" ? body?.order : undefined);
    if (value !== undefined) payload[field] = value;
  }

  if (!partial) {
    if (typeof payload.name !== "string" || !payload.name.trim()) {
      throw httpError(400, "Testimonial name is required.");
    }
    if (typeof payload.content !== "string" || !payload.content.trim()) {
      throw httpError(400, "Testimonial content is required.");
    }
    if (payload.rating === undefined) {
      throw httpError(400, "Testimonial rating is required.");
    }
  }

  if (payload.name) payload.name = payload.name.trim();
  if (payload.content) payload.content = payload.content.trim();
  if (payload.program) payload.program = payload.program.trim();
  if (payload.designation) payload.designation = payload.designation.trim();

  return payload;
}

function toTestimonial(row) {
  return {
    id: row.id,
    name: row.name,
    profileImage: row.profile_image,
    designation: row.designation,
    program: row.program,
    rating: row.rating,
    content: row.content,
    featured: row.featured,
    status: row.status,
    order: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createTestimonial(request, response) {
  const payload = testimonialPayload(request.body);
  const profileImage = request.files?.profileImage?.[0];
  if (profileImage) {
    assertFileType(profileImage, "image");
    payload.profile_image = await uploadToStorage({
      client: createAuthenticatedClient(request.accessToken),
      bucket: "testimonial-images",
      folder: "profiles",
      file: profileImage,
    });
  }

  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("testimonials_new")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  response.status(201).json({ data: toTestimonial(data) });
}

async function listAdminTestimonials(request, response) {
  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("testimonials_new")
    .select()
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  response.json({ data: data.map(toTestimonial) });
}

async function updateTestimonial(request, response) {
  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("testimonials_new")
    .update({ ...testimonialPayload(request.body, true), updated_at: new Date().toISOString() })
    .eq("id", request.params.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Testimonial not found.");
  response.json({ data: toTestimonial(data) });
}

async function deleteTestimonial(request, response) {
  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("testimonials_new")
    .delete()
    .eq("id", request.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Testimonial not found.");
  response.status(204).send();
}

async function listTestimonials(request, response) {
  const { data, error } = await supabase
    .from("testimonials_new")
    .select()
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  response.json({ data: data.map(toTestimonial) });
}

module.exports = {
  createTestimonial,
  listAdminTestimonials,
  updateTestimonial,
  deleteTestimonial,
  listTestimonials,
};