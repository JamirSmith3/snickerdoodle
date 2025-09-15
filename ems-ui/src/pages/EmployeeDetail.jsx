// ems-ui/src/pages/EmployeeDetail.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getEmployee } from "../api";

export default function EmployeeDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getEmployee(id);
        if (mounted) setEmp(data);
      } catch (e) {
        setErr(e.message || "Failed to load employee");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; }
  }, [id]);

  if (loading) return <div style={{ padding: 18 }}>Loading…</div>;
  if (err) return <div style={{ padding: 18, color: "var(--bad)" }}>{err}</div>;
  if (!emp) return <div style={{ padding: 18 }}>Not found.</div>;

  const fullName = `${emp.first_name} ${emp.last_name}`;
  const statusClass = emp.status === "ACTIVE" ? "ok" : "bad";

  return (
    <div className="stack-16">
      <div className="row-between">
        <Link to="/employees" className="btn">
          ← Back to list
        </Link>
        <div className={`badge ${statusClass} status-pill`}>{emp.status}</div>
      </div>

      <div className="card employee-detail-card">
        <div className="detail-header">
          <div className="avatar">{initialsOf(fullName)}</div>
          <div>
            <h2 className="title">{fullName}</h2>
            <div className="subtext">{emp.role_title}</div>
          </div>
        </div>

        <div className="detail-grid">
          <Detail label="Email" value={emp.email} />
          <Detail label="Department" value={emp.department_name || "—"} />
          <Detail label="Location" value={emp.location || "—"} />
          <Detail label="Status" value={emp.status} />
          <Detail label="Employment Type" value={emp.employment_type || "—"} />
          <Detail label="Hire Date" value={emp.hire_date || "—"} />
          <Detail label="Salary" value={emp.salary ? formatMoney(emp.salary) : "—"} />
          <Detail label="Manager ID" value={emp.manager_id ?? "—"} />
        </div>

        <div className="detail-actions">
          <button className="btn" onClick={() => nav(`/employees/${emp.id}/edit`)}>Edit</button>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-item">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}

function initialsOf(name) {
  const parts = String(name || "").trim().split(/\s+/);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}
function formatMoney(n) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n}`;
  }
}
