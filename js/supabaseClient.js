// ============================================================
// Supabase client — single shared instance for the whole app
// Requires the supabase-js UMD script to be loaded first (see <head> of each page)
// ============================================================
(function () {
  if (!window.APP_CONFIG || window.APP_CONFIG.SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL") {
    console.warn("⚠️ Supabase is not configured yet. Edit js/config.js with your project URL + anon key.");
  }
  window.sb = window.supabase.createClient(
    window.APP_CONFIG.SUPABASE_URL,
    window.APP_CONFIG.SUPABASE_ANON_KEY
  );
})();
