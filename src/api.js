const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => "Request failed.");
    throw new Error(text || res.statusText);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export async function login(username, password) {
  const res = await fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handle(res);
}

export async function listEmployees(token, { search = "", page = 1, limit = 20 } = {}) {
  const qs = new URLSearchParams({ search, page, limit });
  const res = await fetch(`${API}/employees?${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return handle(res);
}
