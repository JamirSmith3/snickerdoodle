import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getEmployee } from "../api";
import Avatar from "../components/Avatar";

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
    <section className="stack-16" aria-labelledby="emp-title">
      <div className="row-between">
        <Link to="/employees" className="btn" aria-label="Back to employees list">← Back to list</Link>
        <div className={`badge ${statusClass} status-pill`} aria-label={`Status ${emp.status}`}>{emp.status}</div>
      </div>

      <article className="card employee-detail-card">
        <header className="detail-header">
          <Avatar name={fullName} size={48} />
          <div>
            <h2 className="title" id="emp-title">{fullName}</h2>
            <div className="subtext">{emp.role_title}</div>
            {emp.manager_name && emp.manager_id && (
              <div className="subtext">Manager: <Link to={`/employees/${emp.manager_id}`} className="link">{emp.manager_name}</Link></div>
            )}
          </div>
        </header>

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
          <button className="btn" onClick={() => nav(`/employees/${emp.id}/edit`)} aria-label="Edit employee">Edit</button>
        </div>
      </article>
    </section>
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
function formatMoney(n) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n}`;
  }
}
