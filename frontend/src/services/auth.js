import { reactive } from "vue";

const STORAGE_KEY = "probiotics-session";

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export const authState = reactive({
  session: readSession(),
  get user() {
    return this.session?.user || null;
  },
});

export function saveSession(session) {
  authState.session = session;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  authState.session = null;
  localStorage.removeItem(STORAGE_KEY);
}

export function isAdmin() {
  return String(authState.user?.role || "").toLowerCase() === "admin";
}