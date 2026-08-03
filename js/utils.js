// ============================================================
// Shared utility helpers used across all pages
// ============================================================

/** Format seconds -> HH:MM:SS (or MM:SS if under an hour) */
function fmtDuration(totalSeconds) {
  if (totalSeconds == null || isNaN(totalSeconds)) return "--:--";
  totalSeconds = Math.round(totalSeconds);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Parse a manual entry string like "4:35", "275", "1:02:10" into seconds */
function parseDurationInput(str) {
  if (!str) return null;
  str = str.trim();
  if (/^\d+$/.test(str)) return parseInt(str, 10); // plain seconds
  const parts = str.split(":").map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function fmtDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("en-AU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU");
}

function uuid() {
  return crypto.randomUUID();
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert an array of objects to a CSV string */
function toCSV(rows, columns) {
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const header = columns.map((c) => c.label).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escape(typeof c.value === "function" ? c.value(row) : row[c.value])).join(",")
  );
  return [header, ...lines].join("\n");
}

function downloadFile(filename, content, mime = "text/csv") {
  const blob = new Blob([content], { type: mime + ";charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Simple toast notification */
function toast(msg, type = "info") {
  let el = document.getElementById("__toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "__toast";
    el.style.cssText =
      "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:999;" +
      "padding:10px 18px;border-radius:10px;font-size:13px;font-weight:600;color:#fff;" +
      "box-shadow:0 4px 14px rgba(0,0,0,.2);transition:opacity .3s ease;max-width:90vw;text-align:center;";
    document.body.appendChild(el);
  }
  el.style.background = type === "error" ? "#dc2626" : type === "warn" ? "#d97706" : "#00843D";
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(() => (el.style.opacity = "0"), 2500);
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
