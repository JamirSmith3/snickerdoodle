import { Routes, Route, Navigate, NavLink, Outlet } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import EmployeesGrid from "./pages/EmployeesGrid";
import EmployeeDetail from "./pages/EmployeeDetail";
import EmployeeForm from "./pages/EmployeeForm";
import Login from "./pages/Login";

import { useAuth } from "./auth";
import GlobalErrorBanner from "./components/GlobalErrorBanner";
import ToastHost from "./components/ToastHost";
import Departments from "./pages/Departments";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function Shell() {
  const { signOut } = useAuth();
  return (
    <div className="app">
      <aside className="sidebar" aria-label="Main navigation">
        <h3>Navigation</h3>
        <nav className="nav" aria-label="Sections">
          <NavLink to="/employees" end>Employees</NavLink>
          <NavLink to="/departments">Departments</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
        <div style={{ marginTop: "auto" }}>
          <button className="btn ghost" onClick={signOut} aria-label="Sign out">Sign out</button>
        </div>
      </aside>

      <main style={{ display: "grid", gridTemplateRows: "66px 1fr" }} role="main">
        <div className="topbar">
          <strong>Employee Manager</strong>
        </div>
        <div className="content">
          <GlobalErrorBanner />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastHost>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><Shell /></ProtectedRoute>}>
          <Route index element={<Navigate to="/employees" replace />} />
          <Route path="/employees" element={<EmployeesGrid />} />
          <Route path="/employees/new" element={<EmployeeForm />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/employees/:id/edit" element={<EmployeeForm />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<Navigate to="/employees" replace />} />
      </Routes>
    </ToastHost>
  );
}