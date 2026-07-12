// Thin REST client used once a real backend exists. Every function in
// storage.js delegates here when VITE_API_BASE_URL is configured, so wiring
// up the backend is a one-line env change — no call sites elsewhere change.
//
// Expected REST conventions per collection (e.g. "vehicles", "drivers",
// "trips", "maintenance", "fuelLogs", "expenses", "users"):
//   GET    /{collection}         -> array of records
//   POST   /{collection}         -> created record (body: record) -> returns record
//   PATCH  /{collection}/:id     -> updated record (body: partial patch)
//   DELETE /{collection}/:id     -> 204/200
//
// Auth: if a session is stored (see authService), its token (if the backend
// issues one) is sent as `Authorization: Bearer <token>`. Until a real auth
// endpoint exists, this is a no-op.

const SESSION_KEY = "transitops:session";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || null;

function authHeaders() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) : null;
    return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
  } catch {
    return {};
  }
}

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {
      // response wasn't JSON — keep the default message
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const apiClient = {
  list: (collection) => request(`/${collection}`),
  create: (collection, record) => request(`/${collection}`, { method: "POST", body: record }),
  update: (collection, id, patch) => request(`/${collection}/${id}`, { method: "PATCH", body: patch }),
  remove: (collection, id) => request(`/${collection}/${id}`, { method: "DELETE" }),
  post: (path, body) => request(path, { method: "POST", body }),
};
