import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createEmployee, getDepartments, getEmployee, updateEmployee } from "../api";
import { useToast } from "../components/ToastHost";

const EMPTY = {
  first_name: "", last_name: "", email: "", role_title: "",
  department_id: "", status: "ACTIVE", employment_type: "FT",
  location: "", hire_date: "", salary: "", manager_id: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmployeeForm() {
  const toast = useToast();
  const { id: idParam } = useParams();
  const isEdit = useMemo(() => /^\d+$/.test(String(idParam || "")), [idParam]);
  const numericId = isEdit ? Number(idParam) : null;

  const nav = useNavigate();
  const [depts, setDepts] = useState([]);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [deptList, emp] = await Promise.all([
          getDepartments(),
          isEdit ? getEmployee(numericId) : Promise.resolve(null),
        ]);
        if (!mounted) return;
        setDepts(deptList || []);
        setValues(emp ? {
          first_name: emp.first_name || "",
          last_name:  emp.last_name  || "",
          email:      emp.email      || "",
          role_title: emp.role_title || "",
          department_id: emp.department_id ?? "",
          status: emp.status || "ACTIVE",
          employment_type: emp.employment_type || "FT",
          location: emp.location || "",
          hire_date: emp.hire_date || "",
          salary: emp.salary ?? "",
          manager_id: emp.manager_id ?? "",
        } : EMPTY);
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
    setErrors((es) => ({ ...es, [name]: undefined }));
  }

  function validate(v) {
    const es = {};
    if (!v.first_name.trim()) es.first_name = "First name is required.";
    if (!v.last_name.trim())  es.last_name  = "Last name is required.";
    if (!EMAIL_RE.test(v.email.trim())) es.email = "Enter a valid email.";
    if (!v.role_title.trim()) es.role_title = "Role title is required.";

    if (v.salary !== "" && v.salary !== null) {
      const n = Number(v.salary);
      if (Number.isNaN(n)) es.salary = "Salary must be a number.";
      else if (n <= 0)     es.salary = "Salary must be greater than 0.";
    }
    if (v.hire_date && isNaN(Date.parse(v.hire_date))) {
      es.hire_date = "Enter a valid date.";
    }
    if (v.manager_id !== "" && v.manager_id !== null) {
      const m = Number(v.manager_id);
      if (!Number.isInteger(m) || m < 1) es.manager_id = "Manager ID must be an integer ≥ 1, or leave blank.";
    }
    return es;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const es = validate(values);
    setErrors(es);
    if (Object.keys(es).length) return;

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
      salary: values.salary === "" ? null : Number(values.salary),
      manager_id: values.manager_id === "" ? null : Number(values.manager_id),
    };

    try {
      if (isEdit && numericId) {
        await updateEmployee(numericId, payload);
        toast.show("Employee updated successfully.");
      } else {
        await createEmployee(payload);
        toast.show("Employee created successfully.");
      }
      nav("/employees");
    } catch (e2) {
      setErr(e2.message || "Save failed");
    }
  }

  if (loading) return <div style={{ padding: 18 }}>Loading…</div>;

  return (
    <div className="stack-16">
      <div className="row-between">
        <h2 style={{ margin: 0 }}>{isEdit ? "Edit" : "Add"} <span style={{ opacity:.6 }}>Employee</span></h2>
        <Link to="/employees" className="btn">Back to list</Link>
      </div>

      <form className="card" style={{ padding: 16 }} onSubmit={onSubmit} noValidate>
        <div className="detail-grid">
          <Field label="First name *" error={errors.first_name}>
            <input className="input" name="first_name" value={values.first_name} onChange={onChange} />
          </Field>
          <Field label="Last name *" error={errors.last_name}>
            <input className="input" name="last_name" value={values.last_name} onChange={onChange} />
          </Field>

          <Field label="Email *" error={errors.email}>
            <input className="input" name="email" value={values.email} onChange={onChange} inputMode="email" />
          </Field>
          <Field label="Role title *" error={errors.role_title}>
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

          <Field label="Hire date" error={errors.hire_date}>
            <input className="input" type="date" name="hire_date" value={values.hire_date || ""} onChange={onChange} />
          </Field>
          <Field label="Salary" error={errors.salary}>
            <input className="input" name="salary" value={values.salary} onChange={onChange} inputMode="decimal" />
          </Field>

          <Field label="Manager ID" error={errors.manager_id}>
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

function Field({ label, error, children }) {
  return (
    <div className="detail-item">
      <div className="label">{label}</div>
      <div className="value">{children}</div>
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
