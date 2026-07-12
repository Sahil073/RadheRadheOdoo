import * as storage from "./storage";
import { apiClient, API_BASE_URL } from "./apiClient";
import { seedUsers } from "@/data/seed";

const COLLECTION = "users";
const SESSION_KEY = "transitops:session";

storage.seedIfEmpty(COLLECTION, seedUsers);

export async function login(email, password) {
  // Once a real backend is configured, delegate to its auth endpoint instead
  // of comparing passwords client-side against the mock user list.
  if (API_BASE_URL) {
    const session = await apiClient.post("/auth/login", { email, password });
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  const users = await storage.getAll(COLLECTION);
  const match = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
  if (!match) {
    throw new Error("Invalid email or password.");
  }
  const session = { id: match.id, name: match.name, email: match.email, role: match.role };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function demoAccounts() {
  const users = await storage.getAll(COLLECTION);
  return users.map((u) => ({ email: u.email, role: u.role }));
}
