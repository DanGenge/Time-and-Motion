// ============================================================
// Activity Library — seeded from the Ravensworth MMU master list
// Each activity now carries a suggested `bucket` so "Load standard
// library" drops them into logical workflow groups. You can still
// create/rename/reorder buckets and drag activities anywhere.
// ============================================================
window.ACTIVITY_LIBRARY = {
  meta: { name: "MMU Reload & Operations (Ravensworth/Mangoola)" },

  // Order buckets should be created in (top -> bottom on the board)
  buckets: ["Pre-shift & Safety", "Travel & Queue", "Reload", "On-bench", "Admin & Maintenance", "Customer Delays", "Orica Delays", "Other"],

  activities: [
    // ---------------- Pre-shift & Safety ----------------
    { code: "1",  group: "task", bucket: "Pre-shift & Safety", name: "Shift Briefing (GCOM)" },
    { code: "2",  group: "task", bucket: "Pre-shift & Safety", name: "Tool Box Talk" },
    { code: "3",  group: "task", bucket: "Pre-shift & Safety", name: "MMU Prestart" },
    { code: "12", group: "task", bucket: "Pre-shift & Safety", name: "Orica Safety Meeting" },
    { code: "11", group: "task", bucket: "Pre-shift & Safety", name: "Training" },

    // ---------------- Travel & Queue ----------------
    { code: "5",  group: "task", bucket: "Travel & Queue", name: "Driving to bench (Travel)" },
    { code: "5b", group: "task", bucket: "Travel & Queue", name: "Driving to reload/yard (Travel)" },
    { code: "6",  group: "task", bucket: "Travel & Queue", name: "Queueing at Reload" },

    // ---------------- Reload ----------------
    {
      code: "4", group: "task", bucket: "Reload", name: "Reloading MMU",
      elements: [
        "Reloading EP Bin 1","Reloading AN Bin 1","Reloading AN Bin 2","Reloading AN Bin 3",
        "Reloading Water","Travel within reload","Reloading Process Fuel and Road fuel",
        "Reloading Gasser and Compsol","Travel within yard","Park in the yard"
      ]
    },

    // ---------------- On-bench ----------------
    {
      code: "7", group: "task", bucket: "On-bench", name: "Loading Blast Holes",
      elements: ["Paperwork","MMU positioning/setup","Loading","Repositioning on bench"]
    },
    { code: "8",  group: "task", bucket: "On-bench", name: "Operator Break / Crib" },

    // ---------------- Admin & Maintenance ----------------
    { code: "9",  group: "task", bucket: "Admin & Maintenance", name: "End of Shift Paperwork" },
    { code: "10", group: "task", bucket: "Admin & Maintenance", name: "Scheduled Maintenance" },

    // ---------------- Customer Delays ----------------
    { code: "20", group: "customer", bucket: "Customer Delays", name: "MMU not required" },
    { code: "21", group: "customer", bucket: "Customer Delays", name: "Bench Access / Prep" },
    { code: "22", group: "customer", bucket: "Customer Delays", name: "Shot Firer Delay" },
    { code: "22b",group: "customer", bucket: "Customer Delays", name: "Wait on Priming" },
    { code: "23", group: "customer", bucket: "Customer Delays", name: "Blasting / Firing a shot" },
    { code: "24", group: "customer", bucket: "Customer Delays", name: "Load Plan / Sheets (Wait on Data)" },
    { code: "25", group: "customer", bucket: "Customer Delays", name: "Stemming / Backfilling" },
    { code: "26", group: "customer", bucket: "Customer Delays", name: "Drill Delays" },
    { code: "27", group: "customer", bucket: "Customer Delays", name: "Emergency" },
    { code: "28", group: "customer", bucket: "Customer Delays", name: "Raw Materials Delay" },
    { code: "29", group: "customer", bucket: "Customer Delays", name: "Assist on Bench" },
    { code: "30", group: "customer", bucket: "Customer Delays", name: "Tyre Damage" },
    { code: "31", group: "customer", bucket: "Customer Delays", name: "Manning (Customer)" },

    // ---------------- Orica Delays ----------------
    { code: "50", group: "orica", bucket: "Orica Delays", name: "Raw Materials Delay (Orica)" },
    { code: "51", group: "orica", bucket: "Orica Delays", name: "Manning (Orica)" },
    { code: "52", group: "orica", bucket: "Orica Delays", name: "MMU Breakdown" },
    { code: "53", group: "orica", bucket: "Orica Delays", name: "Reload Breakdown" },
    { code: "54", group: "orica", bucket: "Orica Delays", name: "Orica Meeting" },

    // ---------------- Other ----------------
    { code: "80", group: "other", bucket: "Other", name: "Weather" }
  ]
};

window.CATEGORY_META = {
  task:     { label: "Task (Orica productive)", color: "#0093D1" },
  customer: { label: "Customer Delay",           color: "#d97706" },
  orica:    { label: "Orica Delay",              color: "#dc2626" },
  other:    { label: "Other",                    color: "#5b3fa8" }
};
