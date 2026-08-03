// ============================================================
// Live "who's using this project" presence bar
// Uses Supabase Realtime Presence (instant, no polling needed for this part)
// ============================================================
let __presenceChannel = null;

function startPresence(projectId, user, onUpdate) {
  if (__presenceChannel) {
    sb.removeChannel(__presenceChannel);
  }
  __presenceChannel = sb.channel(`presence:project:${projectId}`, {
    config: { presence: { key: user.id } }
  });

  __presenceChannel.on("presence", { event: "sync" }, () => {
    const state = __presenceChannel.presenceState();
    const users = Object.values(state)
      .map((arr) => arr[0])
      .filter(Boolean);
    onUpdate(users);
  });

  __presenceChannel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      await __presenceChannel.track({
        display_name: user.display_name,
        online_at: new Date().toISOString()
      });
    }
  });

  window.addEventListener("beforeunload", stopPresence);
}

function stopPresence() {
  if (__presenceChannel) {
    sb.removeChannel(__presenceChannel);
    __presenceChannel = null;
  }
}

function renderPresenceBar(elementId, users) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (!users.length) {
    el.innerHTML = `<span class="muted">No one else online</span>`;
    return;
  }
  el.innerHTML = users
    .map((u) => `<span class="presence-pill"><span class="dot"></span>${escapeHtml(u.display_name)}</span>`)
    .join("");
}
