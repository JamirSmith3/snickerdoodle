import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { listEmployees } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Employees() {
  const { token, signOut } = useAuth();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const offset = (page - 1) * limit;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  async function fetchEmployees() {
    setLoading(true);
    setErr("");
    try {
      const { rows, total } = await listEmployees(token, { q, limit, offset });
      setRows(rows);
      setTotal(total);
    } catch (e) {
      setErr(e.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // refetch when page changes

  function onSearch() {
    setPage(1);
    fetchEmployees();
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <button onClick={signOut} className="border rounded-lg px-3 py-1 hover:bg-gray-50">
          Sign out
        </button>
      </header>

      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
        />
        <button onClick={onSearch} className="border rounded px-4 py-2 hover:bg-gray-50">
          Search
        </button>
      </div>

      <div className="text-sm text-gray-600">
        {loading ? "Loading…" : `${total} results`}
      </div>

      {err && <p className="text-red-600">{err}</p>}

      {!err && (
        <div className="overflow-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Dept</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <Link className="underline" to={`/employees/${e.id}`}>{e.first_name} {e.last_name}</Link>
                  </td>
                  <td className="p-3">{e.email}</td>
                  <td className="p-3">{e.department_name ?? e.department_id ?? "-"}</td>
                  <td className="p-3">{e.role_title ?? "-"}</td>
                  <td className="p-3">{e.location ?? "-"}</td>
                  <td className="p-3">{e.status}</td>
                </tr>
              ))}
              {(!loading && rows.length === 0) && (
                <tr><td className="p-4 text-center text-gray-500" colSpan={6}>No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

<header className="flex items-center justify-between">
  <h1 className="text-2xl font-semibold">Employees</h1>
  <div className="flex gap-2">
    <Link
      to="/employees/new"
      className="border rounded-lg px-3 py-1 hover:bg-gray-50"
    >
      Add employee
    </Link>
    <button onClick={signOut} className="border rounded-lg px-3 py-1 hover:bg-gray-50">
      Sign out
    </button>
  </div>
</header>

      <div className="flex items-center gap-2">
        <button
          className="border rounded px-3 py-1 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span>Page {page} / {totalPages}</span>
        <button
          className="border rounded px-3 py-1 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
