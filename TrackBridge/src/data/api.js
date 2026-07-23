// Thin "API" layer. Every page imports from here, never from mockData.js
// directly — this is the single seam to swap in real fetch() calls to the
// production TrackBridge REST API once the backend exists.

import { db, nextId, STATUS_LABELS, getOrCreateApiKey, regenerateApiKey } from "./mockData";

const DELAY_MS = 250;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), DELAY_MS));
}

// ---------- Deliveries ----------

export async function listDeliveries({ companyId, customerId, driverId, status } = {}) {
  let rows = db.deliveries;
  if (companyId) rows = rows.filter((d) => d.companyId === companyId);
  if (customerId) rows = rows.filter((d) => d.customerId === customerId);
  if (driverId) rows = rows.filter((d) => d.driverId === driverId);
  if (status && status !== "all") rows = rows.filter((d) => d.status === status);
  return delay([...rows].sort((a, b) => b.createdAt - a.createdAt));
}

export async function createDelivery(payload) {
  const record = {
    id: nextId("delivery"),
    trackingNumber: `WB-${Math.floor(10000 + Math.random() * 89999)}`,
    status: payload.driverId ? "assigned" : "unassigned",
    createdAt: Date.now(),
    events: [{ status: "created", label: "Order placed", at: Date.now() }],
    ...payload,
  };
  db.deliveries.unshift(record);
  return delay(record);
}

export async function updateDeliveryStatus(id, status) {
  const record = db.deliveries.find((d) => d.id === id);
  if (!record) throw new Error("Delivery not found");
  record.status = status;
  record.events.push({ status, label: STATUS_LABELS[status] || status, at: Date.now() });
  return delay(record);
}

export async function findByTrackingNumber(trackingNumber) {
  const record = db.deliveries.find(
    (d) => d.trackingNumber.toLowerCase() === trackingNumber.trim().toLowerCase()
  );
  return delay(record || null);
}

// ---------- Disputes ----------

export async function listDisputes({ companyId } = {}) {
  let rows = db.disputes;
  if (companyId) rows = rows.filter((d) => d.companyId === companyId);
  return delay([...rows].sort((a, b) => b.createdAt - a.createdAt));
}

export async function createDispute(payload) {
  const record = { id: nextId("dispute"), createdAt: Date.now(), status: "open", ...payload };
  db.disputes.unshift(record);
  const delivery = db.deliveries.find((d) => d.id === payload.deliveryId);
  if (delivery) delivery.status = "disputed";
  return delay(record);
}

// ---------- Drivers ----------

export async function listDrivers({ companyId } = {}) {
  let rows = db.drivers;
  if (companyId) rows = rows.filter((d) => d.companyId === companyId);
  return delay([...rows]);
}

export async function registerDriver(payload) {
  const record = { id: nextId("driver"), available: false, ...payload };
  db.drivers.push(record);
  return delay(record);
}

export async function setDriverAvailability(driverId, available) {
  const record = db.drivers.find((d) => d.id === driverId);
  if (record) record.available = available;
  return delay(record);
}

// ---------- Integrations (external "API") ----------
// This section stands in for TrackBridge's public REST API — the thing a
// merchant's own checkout backend would call over HTTPS with a bearer
// key. Here it's just an in-memory function, but the shape mirrors the
// documented endpoint: POST /v1/tracking, wired to POST /v1/deliveries
// under the hood since a tracking number and a delivery record are the
// same object in this system.

export async function getApiKey(companyId) {
  return delay(getOrCreateApiKey(companyId));
}

export async function rollApiKey(companyId) {
  return delay(regenerateApiKey(companyId));
}

export async function listApiActivity({ companyId } = {}) {
  let rows = db.apiActivity;
  if (companyId) rows = rows.filter((r) => r.companyId === companyId);
  return delay([...rows].sort((a, b) => b.at - a.at));
}

/**
 * Simulates an e-commerce backend calling POST /v1/tracking right after
 * an order completes. Creates the underlying delivery record (so it's
 * immediately trackable on /track) and appends an entry to the
 * company's API activity log, exactly like a real request log would.
 */
export async function generateTrackingNumber({ companyId, orderRef, recipientName, recipientEmail, address, item, fee }) {
  const record = {
    id: nextId("delivery"),
    trackingNumber: `WB-${Math.floor(10000 + Math.random() * 89999)}`,
    status: "unassigned",
    createdAt: Date.now(),
    companyId,
    orderRef,
    recipientName,
    recipientEmail,
    address,
    item,
    fee: Number(fee) || 0,
    source: "api",
    events: [{ status: "created", label: "Order placed", at: Date.now() }],
  };
  db.deliveries.unshift(record);

  const logEntry = {
    id: nextId("call"),
    companyId,
    orderRef,
    trackingNumber: record.trackingNumber,
    recipientEmail,
    at: Date.now(),
    status: "success",
  };
  db.apiActivity.unshift(logEntry);

  return delay({
    trackingNumber: record.trackingNumber,
    trackingUrl: `https://trackbridge.io/track?id=${record.trackingNumber}`,
    status: "unassigned",
    emailed: true,
  });
}
