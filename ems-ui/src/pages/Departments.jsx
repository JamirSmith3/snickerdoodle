import { useEffect, useState } from "react";
import { getDepartments } from "../api";

export default function Departments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    getDepartments()
      .then(setRows)
      .catch((e) => setErr(e.message || "Failed to load departments"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="stack-16">
      <h2 style={{ margin: 0 }}>Departments</h2>

      {loading ? (
        <div className="card" style={{ padding: 16, textAlign: "center" }}>Loading…</div>
      ) : err ? (
        <div className="card" style={{ padding: 16, color: "var(--bad)" }}>{err}</div>
      ) : rows.length === 0 ? (
        <div className="card" style={{ padding: 16, textAlign: "center" }}>
          No departments yet
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
          {rows.map((d) => (
            <div key={d.id} className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 600 }}>{d.name}</div>
              {d.description && <div className="subtext" style={{ marginTop: 6 }}>{d.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
