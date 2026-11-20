const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function getToken() { return localStorage.getItem("oh_token"); }
export function setSession(token, user) {
  localStorage.setItem("oh_token", token);
  localStorage.setItem("oh_user", JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem("oh_token");
  localStorage.removeItem("oh_user");
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem("oh_user") || "null"); } catch { return null; }
}

export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return data;
}
