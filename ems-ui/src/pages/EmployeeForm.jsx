import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createEmployee, getDepartments, getEmployee, updateEmployee } from "../api";
import { useAuth } from "../auth";

const DEFAULT = {
  first_name:"", last_name:"", email:"", role_title:"",
  department_id:"", employment_type:"FT", status:"ACTIVE",
  location:"", manager_id:"", hire_date:"", salary:""
};

export default function EmployeeForm(){
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState(DEFAULT);
  const [depts, setDepts] = useState([]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    (async()=>{
      try{
        setDepts(await getDepartments(token));
        if (isEdit) {
          const row = await getEmployee(token, id);
          setForm({
            ...DEFAULT,
            ...row,
            department_id: row.department_id || "",
            manager_id: row.manager_id || "",
            hire_date: row.hire_date ? row.hire_date.slice(0,10) : ""
          });
        }
      }catch(e){ setErr(e.message); }
    })();
  }, [id, isEdit, token]);

  function update(k, v){ setForm(f=>({...f, [k]: v })) }

  async function onSubmit(e){
    e.preventDefault();
    setErr(""); setSaving(true);
    try{
      const payload = {...form};
      ["department_id","manager_id","salary"].forEach(k=>{
        if (payload[k] === "" || payload[k] == null) delete payload[k];
      });
      if (isEdit) await updateEmployee(token, id, payload);
      else await createEmployee(token, payload);
      nav("/employees");
    }catch(e){ setErr(e.message || "Save failed"); }
    finally{ setSaving(false); }
  }

  return (
    <div style={{display:"grid", gap:14}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <h2 style={{margin:0}}>{isEdit ? "Edit Employee" : "Add Employee"}</h2>
        <Link to="/employees" className="btn ghost">Back to list</Link>
      </div>

      <form onSubmit={onSubmit} className="card" style={{padding:16, display:"grid", gap:12}}>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
          <label><div className="lbl">First name *</div>
            <input className="input" value={form.first_name} onChange={e=>update("first_name", e.target.value)} required />
          </label>
          <label><div className="lbl">Last name *</div>
            <input className="input" value={form.last_name} onChange={e=>update("last_name", e.target.value)} required />
          </label>
          <label style={{gridColumn:"1 / span 2"}}><div className="lbl">Email *</div>
            <input className="input" value={form.email} onChange={e=>update("email", e.target.value)} required />
          </label>
          <label style={{gridColumn:"1 / span 2"}}><div className="lbl">Role title *</div>
            <input className="input" value={form.role_title} onChange={e=>update("role_title", e.target.value)} required />
          </label>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12}}>
          <label><div className="lbl">Department</div>
            <select className="input" value={form.department_id} onChange={e=>update("department_id", e.target.value)}>
              <option value="">— None —</option>
              {depts.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>
          <label><div className="lbl">Status</div>
            <select className="input" value={form.status} onChange={e=>update("status", e.target.value)}>
              <option>ACTIVE</option><option>INACTIVE</option>
            </select>
          </label>
          <label><div className="lbl">Employment type</div>
            <select className="input" value={form.employment_type} onChange={e=>update("employment_type", e.target.value)}>
              <option>FT</option><option>PT</option><option>CONTRACT</option>
            </select>
          </label>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12}}>
          <label><div className="lbl">Location</div>
            <input className="input" value={form.location} onChange={e=>update("location", e.target.value)} />
          </label>
          <label><div className="lbl">Hire date</div>
            <input type="date" className="input" value={form.hire_date} onChange={e=>update("hire_date", e.target.value)} />
          </label>
          <label><div className="lbl">Salary</div>
            <input className="input" type="number" step="0.01" value={form.salary} onChange={e=>update("salary", e.target.value)} />
          </label>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
          <label><div className="lbl">Manager ID</div>
            <input className="input" value={form.manager_id} onChange={e=>update("manager_id", e.target.value)} placeholder="e.g. 2"/>
          </label>
        </div>

        {err && <div style={{color:"var(--bad)"}}>{err}</div>}

        <div style={{display:"flex", gap:8}}>
          <button className="btn primary" disabled={saving}>{saving ? "Saving…" : (isEdit ? "Save changes" : "Create employee")}</button>
          <Link className="btn ghost" to="/employees">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
