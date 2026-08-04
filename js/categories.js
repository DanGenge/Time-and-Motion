// ============================================================
// CategoryStore — editable + custom badge categories per project.
// The 4 built-ins (task/customer/orica/other) stay as the reporting
// backbone; custom categories map to one of them via report_group.
// ============================================================
window.CategoryStore = {
  list: [],
  byId: {},

  BUILTINS: [
    { label: "Task",     color: "#0093D1", report_group: "task" },
    { label: "Customer", color: "#d97706", report_group: "customer" },
    { label: "Orica",    color: "#dc2626", report_group: "orica" },
    { label: "Other",    color: "#5b3fa8", report_group: "other" }
  ],

  async load(projectId) {
    let { data } = await sb.from("categories").select("*").eq("project_id", projectId).order("sort_order");
    if (!data || !data.length) {
      await this.seedBuiltins(projectId);
      ({ data } = await sb.from("categories").select("*").eq("project_id", projectId).order("sort_order"));
    }
    this.list = data || [];
    this.byId = {};
    this.list.forEach(c => this.byId[c.id] = c);
    return this.list;
  },

  async seedBuiltins(projectId) {
    const rows = this.BUILTINS.map((b, i) => ({
      project_id: projectId, label: b.label, color: b.color,
      report_group: b.report_group, is_builtin: true, sort_order: i
    }));
    await sb.from("categories").insert(rows);
  },

  get(id) { return this.byId[id] || null; },

  // first category matching a report group (used to back-map legacy activities)
  byReportGroup(g) {
    return this.list.find(c => c.report_group === g) || null;
  },

  // resolve the category for a step (prefer explicit category_id, else report group)
  forStep(step) {
    return this.get(step.category_id) || this.byReportGroup(step.category_group || "task") || this.list[0] || null;
  }
};

// translucent background from a hex colour
function hexA(hex, a) {
  if (!hex) return `rgba(0,147,209,${a})`;
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// badge HTML from a category record (or a {label,color} snapshot)
function catBadgeHtml(cat) {
  if (!cat) return '<span class="badge cat-task">task</span>';
  const c = cat.color || "#0093D1";
  return `<span class="badge" style="background:${hexA(c, 0.14)};color:${c};">${escapeHtml(cat.label || "")}</span>`;
}

// badge from an entry row's snapshot (label/color stored at save time)
function entryBadgeHtml(e) {
  const label = e.category_label || (e.category_group || "task");
  const color = e.category_color || defaultGroupColor(e.category_group || "task");
  return catBadgeHtml({ label, color });
}

function defaultGroupColor(g) {
  return ({ task: "#0093D1", customer: "#d97706", orica: "#dc2626", other: "#5b3fa8" })[g] || "#0093D1";
}
