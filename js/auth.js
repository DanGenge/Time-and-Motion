// ============================================================
// Auth helpers — shared across all pages
// ============================================================

/** Returns the current session's user, or null. */
async function getCurrentUser() {
  const { data, error } = await sb.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

/** Returns { id, email, display_name } or null. Redirects to login if not authed & required=true */
async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
  return { id: user.id, email: user.email, display_name: profile?.display_name || user.email };
}

async function signUp(email, password, displayName) {
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } }
  });
  return { data, error };
}

async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function signOut() {
  await sb.auth.signOut();
  window.location.href = "index.html";
}

/** Renders the shared top nav bar into #topbar-container, highlighting the active page */
async function renderTopbar(activePage, currentUser) {
  const container = document.getElementById("topbar-container");
  if (!container) return;
  const projectId = getParam("project") || "";
  const q = projectId ? `?project=${projectId}` : "";
  const links = [
    { key: "project", label: "Project", href: `project.html${q}` },
    { key: "templates", label: "Templates", href: `templates.html${q}` },
    { key: "tracker", label: "Tracker", href: `tracker.html${q}` },
    { key: "reports", label: "Reports", href: `reports.html${q}` },
    { key: "export", label: "Export", href: `export.html${q}` }
  ];
  container.innerHTML = `
    <div class="topbar">
      <div class="brand"><span class="wordmark">orica</span> <span class="product">Time &amp; Motion Tracker</span></div>
      <nav>
        <a href="index.html" class="${activePage === "index" ? "active" : ""}">Projects</a>
        ${projectId ? links.map(l => `<a href="${l.href}" class="${activePage === l.key ? "active" : ""}">${l.label}</a>`).join("") : ""}
      </nav>
      <div class="user-chip">
        👤 ${escapeHtml(currentUser?.display_name || "")}
        <button onclick="signOut()">Sign out</button>
      </div>
    </div>`;
}
