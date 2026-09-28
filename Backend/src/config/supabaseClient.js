const { createClient } = require("@supabase/supabase-js");
const { supabaseUrl, supabaseAnonKey } = require("./env");

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

module.exports = supabase;