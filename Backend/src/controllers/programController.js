const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabaseClient");
const { supabaseUrl, supabaseAnonKey } = require("../config/env");
const { uploadToStorage, assertFileType } = require("../utils/storageUpload");

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
  const payload = programPayload(request.body);
  const files = request.files || {};
  if (files.image?.[0]) {
    assertFileType(files.image[0], "image");
    payload.image_url = await uploadToStorage({
      client: requestClient(request),
      bucket: "program-images",
      folder: payload.slug,
      file: files.image[0],
    });
  }
  if (files.brochure?.[0]) {
    assertFileType(files.brochure[0], "pdf");
    payload.brochure_url = await uploadToStorage({
      client: requestClient(request),
      bucket: "program-brochures",
      folder: payload.slug,
      file: files.brochure[0],
    });
  }

  const { data, error } = await requestClient(request)
    .from("programs_new")
    .insert(payload)
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
  const payload = programPayload(request.body, true);
  const files = request.files || {};
  const client = requestClient(request);
  const folder = payload.slug || request.params.id;
  let existingProgram;

  if (files.image?.[0] || files.brochure?.[0]) {
    const { data, error } = await client
      .from("programs_new")
      .select("image_url, brochure_url")
      .eq("id", request.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw httpError(404, "Program not found.");
    existingProgram = data;
  }

  if (files.image?.[0]) {
    assertFileType(files.image[0], "image");
    payload.image_url = await uploadToStorage({
      client,
      bucket: "program-images",
      folder,
      file: files.image[0],
      existingUrl: existingProgram.image_url,
      supabaseUrl,
    });
  }
  if (files.brochure?.[0]) {
    assertFileType(files.brochure[0], "pdf");
    payload.brochure_url = await uploadToStorage({
      client,
      bucket: "program-brochures",
      folder,
      file: files.brochure[0],
      existingUrl: existingProgram.brochure_url,
      supabaseUrl,
    });
  }

  const { data, error } = await client
    .from("programs_new")
    .update({ ...payload, updated_at: new Date().toISOString() })
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
    .order("created_at", { ascending: false });

  if (error) throw error;
  response.json({ data: data.map(toProgram) });
}

async function getPublicProgram(request, response) {
  const { data, error } = await supabase
    .from("programs_new")
    .select()
    .eq("slug", request.params.slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Program not found.");
  response.json({ data: toProgram(data) });
}

async function getPublicProgramPricing(request, response) {
  const courseNames = [
    ...new Set(
      (Array.isArray(request.query.courseName)
        ? request.query.courseName
        : [request.query.courseName]
      )
        .filter((name) => typeof name === "string")
        .map((name) => name.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

  if (!courseNames.length) {
    throw httpError(400, "At least one course name is required.");
  }

  const { data, error } = await supabase
    .from("program_pricing_new")
    .select(
      "course_name, self_actual_price, self_current_price, mentor_actual_price, mentor_current_price, professional_actual_price, professional_current_price, currency",
    )
    .in("course_name", courseNames);

  if (error) throw error;

  const pricing = courseNames
    .map((courseName) => data.find((row) => row.course_name === courseName))
    .find(Boolean);

  if (!pricing) throw httpError(404, "Program pricing not found.");

  response.json({
    data: {
      courseName: pricing.course_name,
      currency: pricing.currency,
      selfLearning: {
        actualPrice: Number(pricing.self_actual_price),
        currentPrice: Number(pricing.self_current_price),
      },
      mentorPaced: {
        actualPrice: Number(pricing.mentor_actual_price),
        currentPrice: Number(pricing.mentor_current_price),
      },
      professional: {
        actualPrice: Number(pricing.professional_actual_price),
        currentPrice: Number(pricing.professional_current_price),
      },
    },
  });
}

module.exports = {
  createProgram,
  listAdminPrograms,
  getAdminProgram,
  updateProgram,
  deleteProgram,
  listPublicPrograms,
  getPublicProgram,
  getPublicProgramPricing,
};