// In-memory mock "backend" for TrackBridge.
// Swap the functions in src/data/api.js for real HTTP calls when the
// actual REST/GraphQL API is ready — every page in this app talks to
// that thin api.js layer, never to this file directly.

let idCounter = 1000;
export function nextId(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export const DELIVERY_STATUSES = [
  "unassigned",
  "assigned",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "failed",
  "disputed",
  "cancelled",
];

export const STATUS_LABELS = {
  unassigned: "Unassigned",
  assigned: "Assigned",
  picked_up: "Picked up",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  failed: "Failed delivery",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

// Seed with zero records so every screen starts in its empty state —
// matching the product's actual first-run experience.
export const db = {
  deliveries: [],
  disputes: [],
  drivers: [],
  users: [],
  apiKeys: {}, // companyId -> "sk_live_xxx"
  apiActivity: [], // log of mock integration calls, newest first
};

function randomKeySegment(len) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// Every company gets a stable-looking mock secret key the first time
// they visit the Integrations page — regenerating it just swaps the
// stored value, same as a real "roll key" action would.
export function getOrCreateApiKey(companyId) {
  if (!db.apiKeys[companyId]) {
    db.apiKeys[companyId] = `sk_live_${randomKeySegment(24)}`;
  }
  return db.apiKeys[companyId];
}

export function regenerateApiKey(companyId) {
  db.apiKeys[companyId] = `sk_live_${randomKeySegment(24)}`;
  return db.apiKeys[companyId];
}

export function resetDb() {
  db.deliveries = [];
  db.disputes = [];
  db.drivers = [];
}
