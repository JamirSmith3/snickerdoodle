const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const listeners = new Set();
export function addApiErrorListener(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emitApiError(payload) { for (const fn of listeners) try { fn(payload); } catch {} }

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

  const url = `${API}${path}`;

  const doFetch = () => fetch(url, opts);

  let res;
  try {
    res = await doFetch();
  } catch (networkErr) {
    emitApiError({ message: "Network error. Check your connection.", retry: () => doFetch() });
    throw networkErr;
  }

  if (res.status === 401) {
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
    const canRetry = method === "GET" || method === "HEAD";
    emitApiError({
      message: msg || "Request failed",
      retry: canRetry ? () => fetch(url, opts) : null
    });
    throw new Error(msg || "Request failed");
  }

  return res;
}

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
