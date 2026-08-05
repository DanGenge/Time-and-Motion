// ============================================================
// Auth helpers — shared across all pages
// GitHub Pages + Supabase only. No Netlify dependency.
// ============================================================

function setLastProject(id) {
  try { localStorage.setItem("tm_last_project", id); } catch (e) {}
}

function getLastProject() {
  try { return localStorage.getItem("tm_last_project") || ""; } catch (e) { return ""; }
}

async function getCurrentUser() {
  const { data, error } = await sb.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "index.html";
    return null;
  }

  const { data: profile } = await sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    display_name: profile?.display_name || user.email
  };
}

async function signUp(email, password, displayName) {
  return await sb.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } }
  });
}

async function signIn(email, password) {
  return await sb.auth.signInWithPassword({ email, password });
}

async function signOut() {
  await sb.auth.signOut();
  window.location.href = "index.html";
}

async function renderTopbar(activePage, currentUser) {
  const container = document.getElementById("topbar-container");
  if (!container) return;

  const urlProject = getParam("project");
  const urlRun = getParam("run");
  if (urlProject) setLastProject(urlProject);

  const projectId = urlProject || getLastProject();
  const projectQ = projectId ? `?project=${projectId}` : "";
  const trackerQ = projectId && urlRun ? `?project=${projectId}&run=${urlRun}` : projectQ;

  const links = [
    { key: "project", label: "Project", href: `project.html${projectQ}`, needsProject: true },
    { key: "templates", label: "Templates", href: `templates.html${projectQ}`, needsProject: true },
    { key: "dimensions", label: "Dimensions", href: `dimensions.html${projectQ}`, needsProject: true },
    { key: "tracker", label: "Tracker", href: `tracker.html${trackerQ}`, needsProject: true },
    { key: "reports", label: "Reports", href: `reports.html${projectQ}`, needsProject: true },
    { key: "export", label: "Export", href: `export.html${projectQ}`, needsProject: true }
  ];

  const navLinks = links.map(l => {
    const disabled = l.needsProject && !projectId;
    const cls = `${activePage === l.key ? "active" : ""} ${disabled ? "disabled" : ""}`.trim();
    const href = disabled ? "#" : l.href;
    return `<a class="${cls}" href="${href}">${escapeHtml(l.label)}</a>`;
  }).join("");

  container.innerHTML = `
    <div class="topbar">
      <div class="brand">
        <span class="brand-logo"><img src="img/orica-logo.png" alt="Orica"></span>
        <span class="product">Time &amp; Motion Tracker</span>
      </div>
      <nav>
        <a class="${activePage === "index" ? "active" : ""}" href="index.html">Projects</a>
        ${navLinks}
      </nav>
      <div class="user-chip">
        <span>👤 ${escapeHtml(currentUser?.display_name || "")}</span>
        <button onclick="signOut()">Sign out</button>
      </div>
    </div>
    <div class="brand-accent"></div>
  `;
}
