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

function partnerPayload(body) {
  const name = body?.name?.trim();
  const logo = body?.logo?.trim() || null;

  if (!name) throw httpError(400, "Partner name is required.");
  return { name, logo };
}

function toPartner(row) {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listPartners(request, response) {
  const { data, error } = await supabase
    .from("partners_new")
    .select()
    .order("created_at", { ascending: false });

  if (error) throw error;
  response.json({ data: data.map(toPartner) });
}

async function createPartner(request, response) {
  const payload = partnerPayload(request.body);
  const logo = request.files?.logo?.[0];
  if (logo) {
    assertFileType(logo, "image");
    payload.logo = await uploadToStorage({
      client: createAuthenticatedClient(request.accessToken),
      bucket: "partner-logos",
      folder: "partners",
      file: logo,
    });
  }

  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("partners_new")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  response.status(201).json({ data: toPartner(data) });
}

async function deletePartner(request, response) {
  const { data, error } = await createAuthenticatedClient(request.accessToken)
    .from("partners_new")
    .delete()
    .eq("id", request.params.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw httpError(404, "Partner not found.");
  response.status(204).send();
}

module.exports = { listPartners, createPartner, deletePartner };