import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getDepartments, listEmployees } from "../api";
import Avatar from "../components/Avatar";

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

  const onEsc = useCallback((e) => {
    if (e.key === "Escape") {
      setQ("");
      setPage(1);
    }
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onEsc]);

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
      <div className="toolbar toolbar--employees" role="search">
        <label className="sr-only" htmlFor="search">Search employees</label>
        <input
          id="search"
          className="input toolbar__search"
          placeholder="Search"
          aria-label="Search employees"
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
        />

        <label className="sr-only" htmlFor="dept">Department filter</label>
        <select
          id="dept"
          className="input toolbar__select"
          value={departmentId}
          onChange={(e) => { setPage(1); setDepartmentId(e.target.value); }}
          aria-label="Filter by department"
        >
          <option value="">Dept</option>
          {depts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="status">Status filter</label>
        <select
          id="status"
          className="input toolbar__select"
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          aria-label="Filter by status"
        >
          <option value="">Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

        <Link to="/employees/new" className="btn primary toolbar__cta" aria-label="Add employee">
          Add employee
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonGrid />
      ) : err ? (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--bad)" }}>{err}</div>
      ) : rows.length === 0 ? (
        <EmptyState q={q} />
      ) : (
        <div className="grid">
          {rows.map((r) => <EmployeeCard key={r.id} row={r} />)}
        </div>
      )}

      {/* Pager */}
      <nav className="pager" aria-label="Pagination">
        <button className="btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} aria-label="Previous page">Prev</button>
        <div aria-live="polite">Page {page} / {totalPages}</div>
        <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} aria-label="Next page">Next</button>
      </nav>
    </div>
  );
}

function EmployeeCard({ row }) {
  const name = `${row.first_name} ${row.last_name}`;
  const statusClass = row.status === "ACTIVE" ? "ok" : "bad";
  return (
    <article className="card employee-card" aria-label={`${name}, ${row.role_title}`}>
      <div className={`badge ${statusClass} status-pill`} aria-label={`Status ${row.status}`}>{row.status}</div>
      <div className="card-body">
        <Avatar name={name} />
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
      {row.manager_name && row.manager_id && (
        <div className="meta-row" style={{ marginTop: 2 }}>
          <span>
            Manager: <Link to={`/employees/${row.manager_id}`} className="link">{row.manager_name}</Link>
          </span>
        </div>
      )}
      <div className="actions">
        <Link className="btn" to={`/employees/${row.id}`} aria-label={`View ${name}`}>View</Link>
        <Link className="btn" to={`/employees/${row.id}/edit`} aria-label={`Edit ${name}`}>Edit</Link>
      </div>
    </article>
  );
}

function EmptyState({ q }) {
  return (
    <div className="card empty-state">
      <svg width="60" height="60" viewBox="0 0 24 24" role="img" aria-label="Empty results">
        <path d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
      <h3>No results</h3>
      {q ? <p>We couldn’t find anyone matching “<strong>{q}</strong>”.</p> : <p>Try adjusting filters or add your first employee.</p>}
      <Link to="/employees/new" className="btn primary" aria-label="Add your first employee">Add employee</Link>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card skeleton">
          <div className="s-line s-badge" />
          <div className="s-row">
            <div className="s-avatar" />
            <div className="s-stack">
              <div className="s-line long" />
              <div className="s-line" />
            </div>
          </div>
          <div className="s-line" />
          <div className="s-line short" />
        </div>
      ))}
    </div>
  );
}
