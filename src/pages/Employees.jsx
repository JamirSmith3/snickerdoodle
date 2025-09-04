import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { listEmployees } from "../api";

export default function Employees() {
  const { token, signOut } = useAuth();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function fetchEmployees() {
    setErr("");
    setLoading(true);
    try {
      const res = await listEmployees(token, { search });
      setData(Array.isArray(res) ? res : res.data ?? []);
    } catch (e) {
      setErr(e.message || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchEmployees} className="border rounded px-4 py-2 hover:bg-gray-50">
          Search
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {!loading && !err && (
        <div className="overflow-auto border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Department</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Location</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3">{e.first_name} {e.last_name}</td>
                  <td className="p-3">{e.email}</td>
                  <td className="p-3">{e.department_name ?? e.department_id ?? "-"}</td>
                  <td className="p-3">{e.role_title ?? "-"}</td>
                  <td className="p-3">{e.location ?? "-"}</td>
                  <td className="p-3">{e.status}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td className="p-4 text-center text-gray-500" colSpan={6}>No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
