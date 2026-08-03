// ============================================================
// Activity Library — seeded from the Ravensworth MMU master list
// (Sheet 4 "MMU Activities at Ravs" + reload elements from Sheet 3)
// Used by the Templates page "Load standard MMU library" button.
// You can still add/edit/delete anything manually afterwards.
// ============================================================
window.ACTIVITY_LIBRARY = {
  meta: { name: "MMU Reload & Operations (Ravensworth/Mangoola)" },

  // Each activity: name, group (task/customer/orica/other), code, optional target seconds,
  // and optional `elements` array (ordered sub-steps that get timed individually).
  activities: [
    // ---------------- TASKS (Orica-productive) ----------------
    { code: "1",  group: "task", name: "Shift Briefing (GCOM)" },
    { code: "2",  group: "task", name: "Tool Box Talk" },
    { code: "3",  group: "task", name: "MMU Prestart" },
    { code: "5",  group: "task", name: "Driving to bench (Travel)" },
    { code: "5b", group: "task", name: "Driving to reload/yard (Travel)" },
    { code: "6",  group: "task", name: "Queueing at Reload" },
    {
      code: "4", group: "task", name: "Reloading MMU",
      elements: [
        "Reloading EP Bin 1",
        "Reloading AN Bin 1",
        "Reloading AN Bin 2",
        "Reloading AN Bin 3",
        "Reloading Water",
        "Travel within reload",
        "Reloading Process Fuel and Road fuel",
        "Reloading Gasser and Compsol",
        "Travel within yard",
        "Park in the yard"
      ]
    },
    {
      code: "7", group: "task", name: "Loading Blast Holes",
      elements: [
        "Paperwork",
        "MMU positioning/setup",
        "Loading",
        "Repositioning on bench"
      ]
    },
    { code: "8",  group: "task", name: "Operator Break / Crib" },
    { code: "9",  group: "task", name: "End of Shift Paperwork" },
    { code: "10", group: "task", name: "Scheduled Maintenance" },
    { code: "11", group: "task", name: "Training" },
    { code: "12", group: "task", name: "Orica Safety Meeting" },

    // ---------------- CUSTOMER DELAYS ----------------
    { code: "20", group: "customer", name: "MMU not required" },
    { code: "21", group: "customer", name: "Bench Access / Prep" },
    { code: "22", group: "customer", name: "Shot Firer Delay" },
    { code: "23", group: "customer", name: "Blasting / Firing a shot" },
    { code: "24", group: "customer", name: "Load Plan / Sheets (Wait on Data)" },
    { code: "25", group: "customer", name: "Stemming / Backfilling" },
    { code: "26", group: "customer", name: "Drill Delays" },
    { code: "27", group: "customer", name: "Emergency" },
    { code: "28", group: "customer", name: "Raw Materials Delay" },
    { code: "29", group: "customer", name: "Assist on Bench" },
    { code: "30", group: "customer", name: "Tyre Damage" },
    { code: "31", group: "customer", name: "Manning (Customer)" },
    { code: "22b", group: "customer", name: "Wait on Priming" },

    // ---------------- ORICA DELAYS ----------------
    { code: "50", group: "orica", name: "Raw Materials Delay (Orica)" },
    { code: "51", group: "orica", name: "Manning (Orica)" },
    { code: "52", group: "orica", name: "MMU Breakdown" },
    { code: "53", group: "orica", name: "Reload Breakdown" },
    { code: "54", group: "orica", name: "Orica Meeting" },

    // ---------------- OTHER ----------------
    { code: "80", group: "other", name: "Weather" }
  ]
};

// Human-friendly labels + colours for the 4 categories (used across the app)
window.CATEGORY_META = {
  task:     { label: "Task (Orica productive)", color: "#0093D1" },
  customer: { label: "Customer Delay",           color: "#d97706" },
  orica:    { label: "Orica Delay",              color: "#dc2626" },
  other:    { label: "Other",                    color: "#5b3fa8" }
};
