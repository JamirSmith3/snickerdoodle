import { useEffect, useState } from "react";
import { addApiErrorListener } from "../api";

export default function GlobalErrorBanner() {
  const [err, setErr] = useState(null); // { message, retry }

  useEffect(() => {
    const off = addApiErrorListener((payload) => setErr(payload));
    return off;
  }, []);

  if (!err) return null;

  return (
    <div className="global-error">
      <div className="global-error__msg">{String(err.message || "Something went wrong")}</div>
      {err.retry && (
        <button
          className="btn"
          onClick={async () => {
            try { await err.retry(); setErr(null); }
            catch { /* if retry fails, keep banner */ }
          }}
        >
          Retry
        </button>
      )}
      <button className="btn" onClick={() => setErr(null)}>Dismiss</button>
    </div>
  );
}
