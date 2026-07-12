import { apiClient, SESSION_STORAGE_KEY } from "./apiClient";

export async function login(email, password) {
  const { token, user } = await apiClient.post("/auth/login", { email, password });
  const session = { token, id: user.id, name: user.name, email: user.email, role: user.role_name };
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getSession() {
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

// Static list for the "Quick Demo Accounts" helper on the login screen —
// matches the users seeded by backend/seed/seed.js (password: password123).
export async function demoAccounts() {
  return [
    { email: "manager@transitops.io", role: "Fleet Manager" },
    { email: "driver@transitops.io", role: "Driver" },
    { email: "safety@transitops.io", role: "Safety Officer" },
    { email: "finance@transitops.io", role: "Financial Analyst" },
  ];
}
