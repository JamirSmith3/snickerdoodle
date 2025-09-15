import { createContext, useContext, useRef, useState } from "react";

const ToastCtx = createContext(null);
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastHost>");
  return ctx;
}

export default function ToastHost({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  function show(msg, opts = {}) {
    const id = idRef.current++;
    setToasts((ts) => [...ts, { id, msg, type: opts.type || "success", ttl: opts.ttl || 2500 }]);
    setTimeout(() => {
      setToasts((ts) => ts.filter((t) => t.id !== id));
    }, opts.ttl || 2500);
  }

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="toast-host">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
