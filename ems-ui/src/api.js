const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(()=> "Request failed");
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
  return handle(res); // token (text) or json depending on your server
}

export async function listEmployees(token, params={}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k,v])=>{
    if (v !== "" && v != null) qs.set(k, String(v));
  });
  const res = await fetch(`${API}/employees?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) throw new Error(typeof data === "string" ? data : "Request failed");

  const totalHeader = res.headers.get("x-total-count");
  const total =
    totalHeader != null ? Number(totalHeader) :
    Array.isArray(data) ? data.length : Number(data?.count ?? 0);

  const rows = Array.isArray(data) ? data : (data?.rows ?? []);
  return { rows, total };
}

export async function getDepartments(token){
  const res = await fetch(`${API}/departments`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return handle(res);
}

export async function getEmployee(token, id){
  const res = await fetch(`${API}/employees/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle(res);
}
export async function createEmployee(token, payload){
  const res = await fetch(`${API}/employees`, {
    method: "POST",
    headers: {"Content-Type":"application/json", Authorization:`Bearer ${token}`},
    body: JSON.stringify(payload),
  });
  return handle(res);
}
export async function updateEmployee(token, id, payload){
  const res = await fetch(`${API}/employees/${id}`, {
    method: "PATCH",
    headers: {"Content-Type":"application/json", Authorization:`Bearer ${token}`},
    body: JSON.stringify(payload),
  });
  return handle(res);
}
export async function deleteEmployee(token, id){
  const res = await fetch(`${API}/employees/${id}`, {
    method: "DELETE",
    headers: { Authorization:`Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
  return true;
}
