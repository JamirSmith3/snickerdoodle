import { useAuth } from "../auth";

export default function Profile() {
  const { user } = useAuth(); // whatever your AuthProvider exposes
  const username = user?.username || localStorage.getItem("user") || "User";

  return (
    <div className="stack-16">
      <h2 style={{ margin: 0 }}>Profile</h2>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>{username}</div>
        <div className="subtext">This is a simple placeholder. Add fields later (name, email, change password…).</div>
      </div>
    </div>
  );
}
