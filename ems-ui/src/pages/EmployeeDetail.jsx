import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getEmployee } from "../api";
import { useAuth } from "../auth";

export default function EmployeeDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { token, signOut } = useAuth();

  const [emp, setEmp] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr(""); setLoading(true);
      try {
        const data = await getEmployee(token, id);
        if (!cancelled) setEmp(data);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Failed to load employee.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, token]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <header className="flex items-center justify-between">
        <div className="space-x-2">
          <Link to="/employees" className="underline">← Back to list</Link>
        </div>
        <button onClick={signOut} className="border rounded px-3 py-1 hover:bg-gray-50">
          Sign out
        </button>
      </header>

      {loading && <p>Loading…</p>}
      {err && <p className="text-red-600">{err}</p>}
      {!loading && !err && emp && (
        <div className="rounded-xl border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h1 className="text-xl font-semibold">
              {emp.first_name} {emp.last_name}
            </h1>
            <p className="text-sm text-gray-600">{emp.role_title}</p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Field label="Email" value={emp.email} />
            <Field label="Department" value={emp.department_name ?? emp.department_id} />
            <Field label="Location" value={emp.location ?? "-"} />
            <Field label="Status" value={emp.status} />
            <Field label="Employment Type" value={emp.employment_type} />
            <Field label="Hire Date" value={emp.hire_date?.slice(0,10) ?? "-"} />
            <Field label="Salary" value={emp.salary ? `$${Number(emp.salary).toLocaleString()}` : "-"} />
            <Field label="Manager ID" value={emp.manager_id ?? "-"} />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
