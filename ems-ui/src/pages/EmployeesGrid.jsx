import { useEffect, useMemo, useState } from "react";
import { listEmployees, getDepartments } from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

function EmployeeCard({ e }){
  const statusClass = e.status === "ACTIVE" ? "badge ok" : "badge bad";
  return (
    <div className="card" style={{padding:14, display:"grid", gap:10}}>
      <div style={{display:"flex", gap:12}}>
        <div style={{
          width:48, height:48, borderRadius:"50%", background:"var(--muted)",
          display:"grid", placeItems:"center", fontWeight:600
        }}>
          {e.first_name[0]}{e.last_name[0]}
        </div>
        <div>
          <div style={{fontWeight:600}}>{e.first_name} {e.last_name}</div>
          <div style={{fontSize:12, color:"var(--sub)"}}>{e.role_title ?? "-"}</div>
        </div>
        <span style={{marginLeft:"auto"}} className={statusClass}>{e.status}</span>
      </div>
      <div style={{fontSize:12, color:"var(--sub)"}}>
        {e.department_name ?? e.department_id ?? "-"} • {e.location ?? "-"}
      </div>
      <div style={{display:"flex", gap:8}}>
        <Link className="btn" to={`/employees/${e.id}`}>View</Link>
        <Link className="btn ghost" to={`/employees/${e.id}/edit`}>Edit</Link>
      </div>
    </div>
  );
}

export default function EmployeesGrid(){
  const { token } = useAuth();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("name"); // local only
  const [page, setPage] = useState(1);
  const limit = 12;

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const offset = (page-1) * limit;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  async function load(){
    setLoading(true); setErr("");
    try{
      const params = { q, limit, offset };
      if (dept) params.department_id = dept;
      if (status) params.status = status;
      const { rows, total } = await listEmployees(token, params);
      // local sort to avoid changing API
      const sorted = [...rows].sort((a,b)=>{
        if (sort === "name") return (a.last_name+a.first_name).localeCompare(b.last_name+b.first_name);
        if (sort === "dept") return (a.department_name||"").localeCompare(b.department_name||"");
        if (sort === "role") return (a.role_title||"").localeCompare(b.role_title||"");
        return 0;
      });
      setRows(sorted);
      setTotal(total);
    }catch(e){ setErr(e.message || "Failed to load"); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); /* eslint-disable-next-line */}, [page, sort]);
  useEffect(()=>{ (async()=>{
    try{ setDepts(await getDepartments(token)); }catch{}
  })(); }, [token]);

  function onSearch(){
    setPage(1);
    load();
  }

  return (
    <div style={{display:"grid", gap:14}}>
      {/* header row */}
      <div style={{display:"grid", gridTemplateColumns:"1fr auto auto auto auto", gap:10}}>
        <input className="input" placeholder="Search" value={q}
          onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter" && onSearch()} />
        <select className="input" value={dept} onChange={e=>{setDept(e.target.value); setPage(1);}}>
          <option value="">Dept</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input" value={status} onChange={e=>{setStatus(e.target.value); setPage(1);}}>
          <option value="">Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
        <select className="input" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="dept">Sort: Dept</option>
          <option value="role">Sort: Role</option>
        </select>
        <button className="btn primary" onClick={()=>nav("/employees/new")}>Add employee</button>
      </div>

      {loading && <div>Loading…</div>}
      {err && <div style={{color:"var(--bad)"}}>{err}</div>}

      {!loading && !err && (
        <>
          <div className="grid">
            {rows.map(e => <EmployeeCard key={e.id} e={e} />)}
          </div>

          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div style={{color:"var(--sub)", fontSize:12}}>{total} results</div>
            <div style={{display:"flex", gap:8, alignItems:"center"}}>
              <button className="btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>Prev</button>
              <span>Page {page} / {totalPages}</span>
              <button className="btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
