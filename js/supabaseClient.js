// Shared Supabase client (requires supabase-js UMD + config.js loaded first)
(function(){
  if(!window.APP_CONFIG||window.APP_CONFIG.SUPABASE_URL==="YOUR_SUPABASE_PROJECT_URL"){
    console.warn("⚠️ Supabase not configured — edit js/config.js");
  }
  window.sb=window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL,window.APP_CONFIG.SUPABASE_ANON_KEY);
})();
