import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminHome() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    try {
      const res = await api.get("/admin/dashboard");
      setData(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard");
      setData(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const employees = data?.employeesCount ?? 0;
  const projects = data?.projectsCount ?? 0;
  const tasks = data?.tasksCount ?? 0;

  const todo = data?.statusCounts?.["To Do"] ?? 0;
  const inProgress = data?.statusCounts?.["In Progress"] ?? 0;
  const done = data?.statusCounts?.["Done"] ?? 0;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Admin Dashboard
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Manage employees, projects, and tasks.
            </p>
          </div>

          <button
            onClick={load}
            className="text-sm px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50
                       dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-200"
          >
            Refresh
          </button>
        </div>

        {err && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
            {err}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Employees" value={employees} />
          <StatCard title="Projects" value={projects} />
          <StatCard title="Tasks" value={tasks} />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="To Do" value={todo} />
          <StatCard title="In Progress" value={inProgress} />
          <StatCard title="Done" value={done} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Latest projects
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              View all
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {(data?.latestProjects || []).length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No projects yet.</p>
            ) : (
              data.latestProjects.map((p) => (
                <div
                  key={p._id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {p.name || p.title || "Untitled Project"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Latest tasks
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              View all
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {(data?.latestTasks || []).length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No tasks yet.</p>
            ) : (
              data.latestTasks.map((t) => (
                <div
                  key={t._id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {t.title}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      {t.status}
                    </span>
                  </div>

                  {t.dueDate ? (
                    <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                      Due: {new Date(t.dueDate).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                      No due date
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm dark:bg-slate-950 dark:border-slate-800">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}
