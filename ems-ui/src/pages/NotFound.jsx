import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="card empty-state">
      <svg width="60" height="60" viewBox="0 0 24 24" role="img" aria-label="Page not found">
        <path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
      <h3>Page not found</h3>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link to="/employees" className="btn primary">Back to employees</Link>
    </div>
  );
}
