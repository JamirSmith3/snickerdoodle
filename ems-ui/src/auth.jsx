import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const signIn = (tokenStr, userInfo = null) => {
    setToken(tokenStr);
    localStorage.setItem("token", tokenStr);
    if (userInfo) {
      setUser(userInfo);
      localStorage.setItem("user", JSON.stringify(userInfo));
    }
  };

  const signOut = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };


  const value = useMemo(() => ({ token, user, signIn, signOut }), [token, user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}