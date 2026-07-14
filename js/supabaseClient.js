(function () {
  const SUPABASE_URL = "https://iwtordghdgttcrzyhbky.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dG9yZGdoZGd0dGNyenloYmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MTQ4NjUsImV4cCI6MjA5OTQ5MDg2NX0.553njnxR_lfSgXLQkmkCcDdZkZGlUmynq_Aj9sUVc-c";

  window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
})();
