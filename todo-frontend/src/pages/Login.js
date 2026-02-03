import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [loginAs, setLoginAs] = useState("employee"); // "admin" | "employee"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const actualRole = res.data.user.role;

      // Optional: block if selected role doesn't match actual role
      if (loginAs && actualRole !== loginAs) {
        return setError(`You selected "${loginAs}" but this account is "${actualRole}".`);
      }

      login(res.data);

      if (actualRole === "admin") navigate("/admin", { replace: true });
      else navigate("/tasks", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  // ✅ FIXED: role buttons now look correct in dark mode
  const roleBtn = (role, title, subtitle) => {
    const active = loginAs === role;

    return (
      <button
        type="button"
        onClick={() => setLoginAs(role)}
        className={[
          "w-full text-left rounded-2xl border p-4 transition",
          active
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
          // dark mode base
          "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
          // dark mode when active: slightly brighter border + deeper bg
          active ? "dark:border-slate-500 dark:bg-slate-800" : "",
        ].join(" ")}
      >
        <div className="font-semibold">{title}</div>
        <div
          className={[
            "text-sm mt-1",
            active ? "text-slate-200" : "text-slate-500",
            "dark:text-slate-300", // ✅ keeps subtitle visible in dark
          ].join(" ")}
        >
          {subtitle}
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100">
      <div className="h-16 bg-white border-b flex items-center px-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="font-bold">Mini-Jira</div>
        <div className="ml-3 text-sm text-slate-500 dark:text-slate-300">
          Employee Work Monitoring
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Left info */}
          <div>
            <h1 className="text-3xl font-bold">Sign in to your workspace</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Track tasks, updates, and progress. Admins can assign work and monitor reports.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="bg-white border rounded-2xl p-4 dark:bg-slate-900 dark:border-slate-800">
                <div className="font-semibold">Admin</div>
                <div className="text-sm text-slate-500 dark:text-slate-300">
                  Manage employees • Assign tasks • View reports
                </div>
              </div>
              <div className="bg-white border rounded-2xl p-4 dark:bg-slate-900 dark:border-slate-800">
                <div className="font-semibold">Employee</div>
                <div className="text-sm text-slate-500 dark:text-slate-300">
                  View tasks • Update status • Add daily updates
                </div>
              </div>
            </div>
          </div>

          {/* Right card */}
          <div className="bg-white border rounded-2xl shadow-sm p-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Login</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                Role-based access
              </span>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium text-slate-700 mb-2 dark:text-slate-200">
                Login as
              </div>
              <div className="grid grid-cols-2 gap-3">
                {roleBtn("employee", "Employee", "Work on assigned tasks")}
                {roleBtn("admin", "Admin", "Manage people & tasks")}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <div>
                <label className="text-sm text-slate-600 dark:text-slate-300">Email</label>
                <input
                  className="mt-1 w-full border rounded-xl px-3 py-2 bg-white text-slate-900
                             dark:bg-slate-950 dark:text-slate-100 dark:border-slate-700
                             focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-sm text-slate-600 dark:text-slate-300">Password</label>
                <input
                  className="mt-1 w-full border rounded-xl px-3 py-2 bg-white text-slate-900
                             dark:bg-slate-950 dark:text-slate-100 dark:border-slate-700
                             focus:outline-none focus:ring-2 focus:ring-slate-400"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <button className="w-full rounded-xl bg-slate-900 text-white py-2.5 hover:bg-slate-800 transition">
                Sign in
              </button>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
                  {error}
                </div>
              )}
            </form>

            <div className="mt-4 text-xs text-slate-500 dark:text-slate-300">
              Tip: Choose the role first, then use the correct credentials.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
