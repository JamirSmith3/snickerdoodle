export default function Avatar({ name = "", size = 40 }) {
  const initials = getInitials(name);
  const color = colorFromString(name || initials);
  const style = {
    width: size, height: size, borderRadius: 999,
    display: "grid", placeItems: "center",
    border: "1px solid var(--ring)",
    background: color.bg, color: color.fg, fontWeight: 700
  };
  return <div className="avatar" style={style} aria-label={`Avatar for ${name}`}>{initials}</div>;
}

function getInitials(n) {
  const parts = String(n).trim().split(/\s+/);
  return (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}

function colorFromString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const palette = [
    ["#1b2a4a", "#89b4ff"],
    ["#1a3a2a", "#8be7b1"],
    ["#402019", "#ffb89e"],
    ["#2a1a3a", "#cfa9ff"],
    ["#123238", "#9be8f1"],
    ["#3a1a2a", "#ffb3c9"],
    ["#26340f", "#d6f48f"],
    ["#2b2b2b", "#eaeaea"],
    ["#0f2f26", "#9ff7da"],
    ["#3a2f0f", "#ffd88b"],
  ];
  const [bg, fg] = palette[h % palette.length];
  return { bg, fg };
}
