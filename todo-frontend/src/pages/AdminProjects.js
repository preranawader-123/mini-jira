import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", key: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/projects", form);
      setForm({ name: "", key: "", description: "" });
      await load();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Failed to create project");
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    setError("");
    try {
      await api.delete(`/projects/${id}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete project");
    }
  };

  return (
    <div className="grid gap-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Projects
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Create and manage projects.
        </p>

        {error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
            {error}
          </div>
        )}

        <form onSubmit={createProject} className="mt-5 grid md:grid-cols-3 gap-3">
          <input
            className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700"
            placeholder="Project name (e.g. HR Onboarding)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700"
            placeholder="Key (e.g. HR)"
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
          />
          <input
            className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <button className="md:col-span-3 rounded-xl bg-slate-900 text-white py-2.5 hover:bg-slate-800">
            Create project
          </button>
        </form>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            All projects
          </h3>
          {loading && <span className="text-sm text-slate-500">Loading...</span>}
        </div>

        <div className="mt-4 space-y-3">
          {projects.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between border border-slate-200 rounded-xl p-4
                         bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
            >
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {p.name}{" "}
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({p.key})
                  </span>
                </div>
                {p.description && (
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {p.description}
                  </div>
                )}
              </div>

              <button onClick={() => deleteProject(p._id)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          ))}

          {!projects.length && !loading && (
            <div className="text-slate-500 dark:text-slate-400">No projects yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
