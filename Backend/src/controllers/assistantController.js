const { createClient } = require("@supabase/supabase-js");
const {
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  groqApiKey,
  groqModel,
} = require("../config/env");
const supabase = require("../config/supabaseClient");
const {
  createAssistantController: createOrvexaAssistantController,
  searchPublicWebsite,
  ...orvexaExports
} = require("../ai");

function profileClientForToken(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function historyClient() {
  if (!supabaseServiceRoleKey) {
    const error = new Error("ORVEXA conversation storage is not configured on the server.");
    error.statusCode = 503;
    error.publicMessage = error.message;
    throw error;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function createAssistantController(options = {}) {
  return createOrvexaAssistantController({
    database: supabase,
    apiKey: groqApiKey,
    model: groqModel,
    createProfileClient: profileClientForToken,
    createHistoryClient: historyClient,
    getWebsiteContent: searchPublicWebsite,
    ...options,
  });
}

module.exports = {
  ...orvexaExports,
  createAssistantController,
};
