const { createClient } = require("@supabase/supabase-js");
const supabase = require("../config/supabaseClient");
const { supabaseUrl, supabaseAnonKey } = require("../config/env");

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

function blogPayload(body, partial = false) {
  const payload = {};
  const aliases = {
    imageUrl: "image_url",
  };

  const fields = ["title", "image_url", "description", "link"];

  for (const field of fields) {
    const apiField = Object.keys(aliases).find((key) => aliases[key] === field) || field;
    const value = body?.[apiField] ?? body?.[field];
    if (value !== undefined) payload[field] = value;
  }

  if (!partial) {
    if (typeof payload.title !== "string" || !payload.title.trim()) {
      throw httpError(400, "Blog title is required.");
    }
    if (typeof payload.description !== "string" || !payload.description.trim()) {
      throw httpError(400, "Blog description is required.");
    }
    if (typeof payload.link !== "string" || !payload.link.trim()) {
      throw httpError(400, "Blog link is required.");
    }
  }

  if (payload.title) payload.title = payload.title.trim();
  if (payload.description) payload.description = payload.description.trim();
  if (payload.link) payload.link = payload.link.trim();
  if (payload.image_url) payload.image_url = payload.image_url.trim();

  return payload;
}

function toBlog(row) {
  if (!row) return row;

  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    description: row.description,
    link: row.link,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listPublicBlogs(request, response) {
  const { data, error } = await supabase
    .from("blogs_new")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  response.json({ data: data.map(toBlog) });
}

async function getPublicBlog(request, response) {
  const { data, error } = await supabase
    .from("blogs_new")
    .select()
    .eq("id", request.params.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Blog not found.");
  response.json({ data: toBlog(data) });
}

async function listAdminBlogs(request, response) {
  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("blogs_new")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  response.json({ data: data.map(toBlog) });
}

async function createBlog(request, response) {
  const payload = blogPayload(request.body);

  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("blogs_new")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  response.status(201).json({ data: toBlog(data) });
}

async function updateBlog(request, response) {
  const payload = blogPayload(request.body, true);

  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("blogs_new")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", request.params.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Blog not found.");
  response.json({ data: toBlog(data) });
}

async function deleteBlog(request, response) {
  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("blogs_new")
    .delete()
    .eq("id", request.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Blog not found.");
  response.status(204).send();
}

module.exports = {
  listPublicBlogs,
  getPublicBlog,
  listAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
};
