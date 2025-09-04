import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;
const DEMO_USER = import.meta.env.VITE_DEMO_USER;
const DEMO_PASS = import.meta.env.VITE_DEMO_PASS;

export default function App() {
  const [token, setToken] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const t = await fetch(`${API}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: DEMO_USER, password: DEMO_PASS }),
        }).then(r => r.text());
        setToken(t);

        const res = await fetch(`${API}/employees?limit=10&offset=0`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRows(data);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Employee Directory (Demo)</h1>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!loading && !error && (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email</th><th>Dept</th><th>Role</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.first_name} {r.last_name}</td>
                <td>{r.email}</td>
                <td>{r.department_name ?? r.department_id}</td>
                <td>{r.role_title}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
        Token preview: {token.slice(0, 12)}… (stored in memory only)
      </p>
    </main>
  );
}
