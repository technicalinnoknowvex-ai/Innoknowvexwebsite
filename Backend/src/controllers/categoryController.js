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

function categoryPayload(body) {
  const name = body?.name?.trim();
  const slug = body?.slug?.trim().toLowerCase();

  if (!name || !slug) throw httpError(400, "Category name and slug are required.");
  return { name, slug };
}

function toCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listCategories(request, response) {
  const { data, error } = await supabase
    .from("program_categories_new")
    .select()
    .order("name");

  if (error) throw error;
  response.json({ data: data.map(toCategory) });
}

async function createCategory(request, response) {
  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("program_categories_new")
    .insert(categoryPayload(request.body))
    .select()
    .single();

  if (error) throw error;
  response.status(201).json({ data: toCategory(data) });
}

async function updateCategory(request, response) {
  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("program_categories_new")
    .update({ ...categoryPayload(request.body), updated_at: new Date().toISOString() })
    .eq("id", request.params.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Category not found.");
  response.json({ data: toCategory(data) });
}

async function deleteCategory(request, response) {
  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("program_categories_new")
    .delete()
    .eq("id", request.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Category not found.");
  response.status(204).send();
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};