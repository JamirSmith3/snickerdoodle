// ems-ui/src/api.js
const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// Core request with auth & 401 handling — returns the raw Response
async function requestRaw(path, { method = "GET", json, headers, ...rest } = {}) {
  const token = localStorage.getItem("token");
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...rest,
  };
  if (json !== undefined) opts.body = JSON.stringify(json);

  const res = await fetch(`${API}${path}`, opts);

  if (res.status === 401) {
    // auto sign-out + redirect
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (!location.pathname.startsWith("/login")) {
      const u = new URL("/login", location.origin);
      u.searchParams.set("expired", "1");
      location.href = u.toString();
    }
    throw new Error("Session expired");
  }

  if (!res.ok) {
    let msg = res.statusText;
    try { msg = await res.text(); } catch {}
    throw new Error(msg || "Request failed");
  }

  return res;
}

// Convenience: JSON body only
async function requestJSON(path, opts) {
  const res = await requestRaw(path, opts);
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export function login(username, password) {
  return requestJSON("/users/login", { method: "POST", json: { username, password } })
    .then((token) => (typeof token === "string" ? token : String(token)));
}

export const getDepartments = () => requestJSON("/departments");

/**
 * listEmployees — always returns { rows, count }
 * - Only sends defined params
 * - Supports both server shapes:
 *   a) response is an array + X-Total-Count header
 *   b) response is { rows, count }
 */
export async function listEmployees(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, String(v));
  }
  const q = qs.toString();

  const res = await requestRaw(`/employees${q ? `?${q}` : ""}`);
  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await res.json() : await res.text();

  const headerCount = Number(res.headers.get("X-Total-Count") || 0);
  const rows = Array.isArray(body) ? body : Array.isArray(body?.rows) ? body.rows : [];
  const count = headerCount || Number(body?.count || rows.length || 0);

  return { rows, count };
}

export const getEmployee    = (id)      => requestJSON(`/employees/${id}`);
export const createEmployee = (payload) => requestJSON("/employees", { method: "POST",  json: payload });
export const updateEmployee = (id, patch) => requestJSON(`/employees/${id}`, { method: "PATCH", json: patch });
export const deleteEmployee = (id)      => requestJSON(`/employees/${id}`, { method: "DELETE" });
