import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import MyTasks from "./pages/MyTasks";
import Inbox from "./pages/Inbox";
import AdminHome from "./pages/AdminHome";
import Employees from "./pages/Employees";

// ✅ Your project uses AdminTasks for Manage Tasks
import AdminTasks from "./pages/AdminTasks";

// ✅ If you already created ManageProjects page, keep this import
import AdminProjects from "./pages/AdminProjects";

import Meetings from "./pages/Meetings";
import Reminders from "./pages/Reminders";

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function ThemeBoot() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    setReady(true);
  }, []);

  if (!ready) return null;
  return null;
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeBoot />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Default */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <Shell>
                  <Navigate to="/tasks" replace />
                </Shell>
              </RequireAuth>
            }
          />

          {/* Common pages */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Shell>
                  <MyTasks />
                </Shell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <Shell>
                  <Inbox />
                </Shell>
              </ProtectedRoute>
            }
          />

          {/* ✅ Old routes redirect to new admin routes (safe) */}
          <Route
            path="/meetings"
            element={
              <ProtectedRoute role="admin">
                <Shell>
                  <Navigate to="/admin/meetings" replace />
                </Shell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <ProtectedRoute role="admin">
                <Shell>
                  <Navigate to="/admin/reminders" replace />
                </Shell>
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Shell>
                  <AdminHome />
                </Shell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute role="admin">
                <Shell>
                  <Employees />
                </Shell>
              </ProtectedRoute>
            }
          />

          {/* ✅ Manage Projects (only if you have ManageProjects page) */}
          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute role="admin">
                <Shell>
                  <AdminProjects />
                </Shell>
              </ProtectedRoute>
            }
          />

          {/* ✅ Manage Tasks (your file is AdminTasks.js) */}
          <Route
            path="/admin/tasks"
            element={
              <ProtectedRoute role="admin">
                <Shell>
                  <AdminTasks />
                </Shell>
              </ProtectedRoute>
            }
          />

          {/* ✅ NEW admin routes (so sidebar refresh won’t bounce) */}
          <Route
            path="/admin/meetings"
            element={
              <ProtectedRoute role="admin">
                <Shell>
                  <Meetings />
                </Shell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reminders"
            element={
              <ProtectedRoute role="admin">
                <Shell>
                  <Reminders />
                </Shell>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
