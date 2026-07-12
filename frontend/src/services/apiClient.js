// Thin REST client for the real TransitOps backend (Express + MongoDB).
// The Vite dev server proxies "/api" to the backend (see vite.config.js),
// so this works with a plain relative path in both dev and any same-origin
// deployment.

const SESSION_KEY = "transitops:session";

function authHeaders() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) : null;
    return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
  } catch {
    return {};
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://radheradheodoo.onrender.com/api";

async function request(path, { method = "GET", body } = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_BASE_URL}${normalizedPath}`, {
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
      message = data.details?.[0]?.message || data.message || data.error || message;
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
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
};

export const SESSION_STORAGE_KEY = SESSION_KEY;
