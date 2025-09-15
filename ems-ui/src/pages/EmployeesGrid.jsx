// ems-ui/src/pages/EmployeesGrid.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getDepartments, listEmployees } from "../api";

const PAGE_SIZE = 12;

export default function EmployeesGrid() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [q, setQ] = useState(() => searchParams.get("q") || "");
  const [departmentId, setDepartmentId] = useState(() => searchParams.get("department_id") || "");
  const [status, setStatus] = useState(() => searchParams.get("status") || "");
  const [page, setPage] = useState(() => Number(searchParams.get("page") || "1"));

  const [depts, setDepts] = useState([]);
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    getDepartments().then(setDepts).catch(() => setDepts([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setErr("");

    const offset = (page - 1) * PAGE_SIZE;
    const params = {
      q: q || undefined,
      department_id: departmentId || undefined,
      status: status || undefined,
      limit: PAGE_SIZE,
      offset,
    };

    listEmployees(params)
      .then(({ rows, count }) => {
        setRows(rows);
        setCount(Number(count || 0));
      })
      .catch((e) => {
        setRows([]);
        setCount(0);
        setErr(e.message || "Failed to load employees");
      })
      .finally(() => setLoading(false));

    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (departmentId) next.set("department_id", departmentId);
    if (status) next.set("status", status);
    if (page !== 1) next.set("page", String(page));
    setSearchParams(next, { replace: true });
  }, [q, departmentId, status, page, setSearchParams]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / PAGE_SIZE)), [count]);

  return (
    <div className="stack-16">
      {/* Toolbar */}
      <div className="toolbar toolbar--employees">
        <input
          className="input toolbar__search"
          placeholder="Search"
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
        />

        <select
          className="input toolbar__select"
          value={departmentId}
          onChange={(e) => { setPage(1); setDepartmentId(e.target.value); }}
          aria-label="Department filter"
        >
          <option value="">Dept</option>
          {depts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          className="input toolbar__select"
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          aria-label="Status filter"
        >
          <option value="">Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

        <Link to="/employees/new" className="btn primary toolbar__cta">
          Add employee
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>Loading…</div>
      ) : err ? (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--bad)" }}>{err}</div>
      ) : rows.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: "center" }}>No results</div>
      ) : (
        <div className="grid">
          {rows.map((r) => <EmployeeCard key={r.id} row={r} />)}
        </div>
      )}

      {/* Pager */}
      <div className="pager">
        <button className="btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
        <div>Page {page} / {totalPages}</div>
        <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
      </div>
    </div>
  );
}

function EmployeeCard({ row }) {
  const name = `${row.first_name} ${row.last_name}`;
  const statusClass = row.status === "ACTIVE" ? "ok" : "bad";
  return (
    <div className="card employee-card">
      <div className={`badge ${statusClass} status-pill`}>{row.status}</div>
      <div className="card-body">
        <div className="avatar">{initialsOf(name)}</div>
        <div className="name-title">
          <div className="name">{name}</div>
          <div className="subtext">{row.role_title}</div>
        </div>
      </div>
      <div className="meta-row">
        <span>{row.department_name || "—"}</span>
        <span>•</span>
        <span>{row.location || "—"}</span>
      </div>
      <div className="actions">
        <Link className="btn" to={`/employees/${row.id}`}>View</Link>
        <Link className="btn" to={`/employees/${row.id}/edit`}>Edit</Link>
      </div>
    </div>
  );
}

function initialsOf(name) {
  const parts = String(name || "").trim().split(/\s+/);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}
