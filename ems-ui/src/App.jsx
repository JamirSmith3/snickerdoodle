import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeesGrid from "./pages/EmployeesGrid";
import EmployeeDetail from "./pages/EmployeeDetail";
import EmployeeForm from "./pages/EmployeeForm";
import Login from "./pages/Login";
import { useAuth } from "./auth";

function Shell({ children }) {
  const { signOut } = useAuth();
  const nav = useNavigate();
  return (
    <div className="app">
      <aside className="sidebar">
        <h3>Navigation</h3>
        <nav className="nav">
          <NavLink to="/employees" className={({isActive}) => isActive ? "active" : ""}>Employees</NavLink>
          <NavLink to="/departments" className={({isActive}) => isActive ? "active" : ""}>Departments</NavLink>
          <NavLink to="/profile" className={({isActive}) => isActive ? "active" : ""}>Profile</NavLink>
        </nav>
        <div style={{marginTop:"auto"}}>
          <button className="btn ghost" onClick={()=>{signOut(); nav("/login")}}>Sign out</button>
        </div>
      </aside>

      <div style={{display:"grid", gridTemplateRows:"66px 1fr"}}>
        <div className="topbar">
          <strong>Employee Manager</strong>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <Shell><EmployeesGrid /></Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/new"
        element={
          <ProtectedRoute>
            <Shell><EmployeeForm /></Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute>
            <Shell><EmployeeDetail /></Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id/edit"
        element={
          <ProtectedRoute>
            <Shell><EmployeeForm /></Shell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/employees" replace />} />
    </Routes>
  );
}