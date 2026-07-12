// Persistence layer. Every function here is `async` on purpose: this is the
// seam where a real backend gets wired in.
//
// - By default (no VITE_API_BASE_URL configured) every call is served from
//   localStorage, so the app runs fully standalone for demos/development.
// - As soon as VITE_API_BASE_URL is set, every call transparently proxies to
//   the real REST API via apiClient.js instead — no call sites in the
//   service modules (vehicleService, tripService, etc.) need to change.
import { apiClient, API_BASE_URL } from "./apiClient";

const NAMESPACE = "transitops";
const LATENCY_MS = 150;
const USE_REMOTE = Boolean(API_BASE_URL);

function key(collection) {
  return `${NAMESPACE}:${collection}`;
}

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

export function seedIfEmpty(collection, seedData) {
  if (USE_REMOTE) return; // the real backend owns its own seed/fixture data
  const existing = window.localStorage.getItem(key(collection));
  if (!existing) {
    window.localStorage.setItem(key(collection), JSON.stringify(seedData));
  }
}

export async function getAll(collection) {
  if (USE_REMOTE) return apiClient.list(collection);
  const raw = window.localStorage.getItem(key(collection));
  return delay(raw ? JSON.parse(raw) : []);
}

export async function saveAll(collection, records) {
  if (USE_REMOTE) {
    // No bulk-replace REST convention is assumed; callers that need this
    // should migrate to targeted insert/update calls against the real API.
    throw new Error("saveAll() is not supported against a remote API — use insert/update instead.");
  }
  window.localStorage.setItem(key(collection), JSON.stringify(records));
  return delay(records);
}

export async function insert(collection, record) {
  if (USE_REMOTE) return apiClient.create(collection, record);
  const all = JSON.parse(window.localStorage.getItem(key(collection)) || "[]");
  all.unshift(record);
  window.localStorage.setItem(key(collection), JSON.stringify(all));
  return delay(record);
}

export async function update(collection, id, patch) {
  if (USE_REMOTE) return apiClient.update(collection, id, patch);
  const all = JSON.parse(window.localStorage.getItem(key(collection)) || "[]");
  const next = all.map((item) => (item.id === id ? { ...item, ...patch } : item));
  window.localStorage.setItem(key(collection), JSON.stringify(next));
  return delay(next.find((item) => item.id === id));
}

export async function remove(collection, id) {
  if (USE_REMOTE) return apiClient.remove(collection, id);
  const all = JSON.parse(window.localStorage.getItem(key(collection)) || "[]");
  const next = all.filter((item) => item.id !== id);
  window.localStorage.setItem(key(collection), JSON.stringify(next));
  return delay(true);
}

export function resetAll() {
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(`${NAMESPACE}:`))
    .forEach((k) => window.localStorage.removeItem(k));
}

export function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
