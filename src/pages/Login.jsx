import { useState } from "react";
import { login } from "../api";
import { useAuth } from "../auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const token = await login(form.username, form.password);
      signIn(token, { username: form.username });
      nav("/employees");
    } catch (e) {
      setErr(e.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <label className="block">
          <span className="text-sm">Username</span>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            autoComplete="username"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm">Password</span>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            autoComplete="current-password"
            required
          />
        </label>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button
          disabled={loading}
          className="w-full rounded-xl px-4 py-2 border hover:bg-gray-50 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
