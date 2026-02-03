import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-lg text-sm transition ${
    isActive
      ? "bg-slate-200 font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100"
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
  }`;

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-64 shrink-0 border-r bg-white min-h-screen p-4 dark:bg-slate-950 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div className="font-bold text-slate-900 dark:text-slate-100">Mini-Jira</div>
        <button
          onClick={handleLogout}
          className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800
                     dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-100"
        >
          Logout
        </button>
      </div>

      <div className="text-xs text-slate-500 mb-3 dark:text-slate-400">
        Role: <span className="font-semibold">{user?.role}</span>
      </div>

      <nav className="space-y-1">
        {/* Core */}
        <NavLink to="/tasks" className={linkClass}>
          My tasks
        </NavLink>
        <NavLink to="/inbox" className={linkClass}>
          Inbox
        </NavLink>

        {/* ✅ Replacing the old "Projects" section with Meeting/Reminder */}
        <div className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Schedule
        </div>

        <NavLink to="/meetings" className={linkClass}>
          Meeting Scheduler
        </NavLink>

        <NavLink to="/reminders" className={linkClass}>
          Reminder
        </NavLink>

        {/* Admin section stays */}
        {user?.role === "admin" && (
          <>
            <div className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Admin
            </div>

            <NavLink to="/admin" className={linkClass}>
              Admin Home
            </NavLink>

            <NavLink to="/admin/employees" className={linkClass}>
              Employees
            </NavLink>

            {/* ✅ Keep Manage Projects (as you requested) */}
            <NavLink to="/admin/projects" className={linkClass}>
              Manage Projects
            </NavLink>

            <NavLink to="/admin/tasks" className={linkClass}>
              Manage Tasks
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
