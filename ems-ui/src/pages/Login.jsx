import { useState } from "react";
import { login } from "../api";
import { useAuth } from "../auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login(){
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ username:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setErr(""); setLoading(true);
    try{
      const token = await login(form.username, form.password);
      signIn(token, { username: form.username });
      nav("/employees");
    }catch(e){ setErr(e.message || "Login failed"); }
    finally{ setLoading(false); }
  }

  return (
    <div style={{height:"100%", display:"grid", placeItems:"center", padding:24}}>
      <div className="card" style={{width:360, padding:22}}>
        <h2 style={{marginTop:0, textAlign:"center"}}>Sign in</h2>
        <form onSubmit={onSubmit} className="space-y-3">
          <label>
            <div style={{fontSize:12, color:"var(--sub)"}}>Username</div>
            <input className="input" value={form.username}
              onChange={e=>setForm(f=>({...f, username:e.target.value}))} autoComplete="username"/>
          </label>
          <label>
            <div style={{fontSize:12, color:"var(--sub)", display:"flex", justifyContent:"space-between"}}>
              <span>Password</span><a href="#" style={{color:"var(--sub)"}}>Forgot password?</a>
            </div>
            <input type="password" className="input" value={form.password}
              onChange={e=>setForm(f=>({...f, password:e.target.value}))} autoComplete="current-password"/>
          </label>
          {err && <div style={{color:"var(--bad)", fontSize:12}}>{err}</div>}
          <button disabled={loading} className="btn primary" style={{width:"100%"}}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div style={{marginTop:10, textAlign:"center"}}>
          <Link to="#" className="btn" style={{width:"100%"}}>Create an account</Link>
        </div>
      </div>
    </div>
  );
}
