import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createEmployee, getDepartments, getEmployee, updateEmployee } from "../api";

const EMPTY = {
  first_name: "",
  last_name: "",
  email: "",
  role_title: "",
  department_id: "",
  status: "ACTIVE",
  employment_type: "FT",
  location: "",
  hire_date: "",
  salary: "",
  manager_id: "",
};

export default function EmployeeForm() {
  const { id: idParam } = useParams();
  const isEdit = useMemo(() => /^\d+$/.test(String(idParam || "")), [idParam]);
  const numericId = isEdit ? Number(idParam) : null;

  const nav = useNavigate();

  const [depts, setDepts] = useState([]);
  const [values, setValues] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [deptList, employee] = await Promise.all([
          getDepartments(),
          isEdit ? getEmployee(numericId) : Promise.resolve(null),
        ]);
        if (!mounted) return;

        setDepts(deptList || []);
        if (employee) {
          setValues({
            first_name: employee.first_name || "",
            last_name: employee.last_name || "",
            email: employee.email || "",
            role_title: employee.role_title || "",
            department_id: employee.department_id ?? "",
            status: employee.status || "ACTIVE",
            employment_type: employee.employment_type || "FT",
            location: employee.location || "",
            hire_date: employee.hire_date || "",
            salary: employee.salary ?? "",
            manager_id: employee.manager_id ?? "",
          });
        } else {
          setValues(EMPTY);
        }
      } catch (e) {
        setErr(e.message || "Failed to load form");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isEdit, numericId]);

  function onChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    // build clean payload
    const payload = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim(),
      role_title: values.role_title.trim(),
      department_id: values.department_id ? Number(values.department_id) : null,
      status: values.status || "ACTIVE",
      employment_type: values.employment_type || "FT",
      location: values.location.trim() || null,
      hire_date: values.hire_date || null,
      salary:
        values.salary === "" || values.salary === null
          ? null
          : Number(values.salary),
      manager_id:
        values.manager_id === "" || values.manager_id === null
          ? null
          : Number(values.manager_id),
    };

    // client-side guards (lightweight)
    if (!payload.first_name || !payload.last_name || !payload.email || !payload.role_title) {
      setErr("Please fill all required fields.");
      return;
    }
    if (payload.salary !== null && Number.isNaN(payload.salary)) {
      setErr("Salary must be a number.");
      return;
    }
    if (payload.manager_id !== null && (!Number.isInteger(payload.manager_id) || payload.manager_id < 1)) {
      setErr("Manager ID must be an integer ≥ 1 or left blank.");
      return;
    }

    try {
      if (isEdit && numericId) {
        await updateEmployee(numericId, payload);
      } else {
        await createEmployee(payload);
      }
      nav("/employees");
    } catch (e) {
      setErr(e.message || "Save failed");
    }
  }

  if (loading) return <div style={{ padding: 18 }}>Loading…</div>;

  return (
    <div className="stack-16">
      <div className="row-between">
        <h2 style={{ margin: 0 }}>{isEdit ? "Edit" : "Add"} <span style={{ opacity:.6 }}>Employee</span></h2>
        <Link to="/employees" className="btn">Back to list</Link>
      </div>

      <form className="card" style={{ padding: 16 }} onSubmit={onSubmit}>
        <div className="detail-grid">
          <Field label="First name *">
            <input className="input" name="first_name" value={values.first_name} onChange={onChange} />
          </Field>
          <Field label="Last name *">
            <input className="input" name="last_name" value={values.last_name} onChange={onChange} />
          </Field>

          <Field label="Email *">
            <input className="input" name="email" value={values.email} onChange={onChange} />
          </Field>
          <Field label="Role title *">
            <input className="input" name="role_title" value={values.role_title} onChange={onChange} />
          </Field>

          <Field label="Department">
            <select className="input" name="department_id" value={values.department_id ?? ""} onChange={onChange}>
              <option value="">— None —</option>
              {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className="input" name="status" value={values.status} onChange={onChange}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </Field>

          <Field label="Employment type">
            <select className="input" name="employment_type" value={values.employment_type} onChange={onChange}>
              <option value="FT">FT</option>
              <option value="PT">PT</option>
              <option value="CONTRACT">CONTRACT</option>
            </select>
          </Field>
          <Field label="Location">
            <input className="input" name="location" value={values.location} onChange={onChange} />
          </Field>

          <Field label="Hire date">
            <input className="input" type="date" name="hire_date" value={values.hire_date || ""} onChange={onChange} />
          </Field>
          <Field label="Salary">
            <input className="input" name="salary" value={values.salary} onChange={onChange} inputMode="decimal" />
          </Field>

          <Field label="Manager ID">
            <input className="input" name="manager_id" placeholder="e.g. 2" value={values.manager_id ?? ""} onChange={onChange} inputMode="numeric" />
          </Field>
        </div>

        {err && <div style={{ color: "var(--bad)", marginTop: 12 }}>{err}</div>}

        <div className="detail-actions" style={{ gap: 8 }}>
          <button className="btn primary" type="submit">
            {isEdit ? "Save changes" : "Create employee"}
          </button>
          <Link className="btn" to="/employees">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="detail-item">
      <div className="label">{label}</div>
      <div className="value">{children}</div>
    </div>
  );
}
