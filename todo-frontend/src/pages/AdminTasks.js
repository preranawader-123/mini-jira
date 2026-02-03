import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminTasks() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: [], // ✅ array
    priority: "Medium",
    dueDate: "",
  });

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [u, t] = await Promise.all([api.get("/users"), api.get("/tasks")]);
      setUsers(u.data || []); // ✅ include admins + employees
      setTasks(t.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createTask = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/tasks", {
        title: form.title,
        description: form.description,
        assignedTo: form.assignedTo,
        priority: form.priority,
        dueDate: form.dueDate || null,
      });

      setForm({
        title: "",
        description: "",
        assignedTo: [],
        priority: "Medium",
        dueDate: "",
      });

      await loadAll();
    } catch (e2) {
      setError(e2?.response?.data?.message || "Failed to create task");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    setError("");
    try {
      await api.delete(`/tasks/${id}`);
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete task");
    }
  };

  const uploadFiles = async (taskId, fileList) => {
    if (!fileList || fileList.length === 0) return;

    const fd = new FormData();
    Array.from(fileList).forEach((f) => fd.append("files", f));

    try {
      await api.post(`/tasks/${taskId}/files`, fd); // ✅ field name "files"
      await loadAll();
    } catch (e) {
      setError(e?.response?.data?.message || "File upload failed");
    }
  };

  return (
    <div className="grid gap-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Tasks (Multi-assign + Files)
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Create tasks, assign to multiple users, and attach reference files.
        </p>

        {error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
            {error}
          </div>
        )}

        <form onSubmit={createTask} className="mt-5 grid md:grid-cols-2 gap-3">
          <input
            className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700"
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          {/* ✅ MULTI SELECT */}
          <select
            multiple
            className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 h-32"
            value={form.assignedTo}
            onChange={(e) =>
              setForm({
                ...form,
                assignedTo: Array.from(e.target.selectedOptions).map((o) => o.value),
              })
            }
            required
          >
            {users.map((u) => (
              <option key={u._id || u.id} value={u._id || u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          <textarea
            className="border rounded-xl px-3 py-2 md:col-span-2 dark:bg-slate-950 dark:border-slate-700"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />

          <select
            className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <input
            className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />

          <button className="md:col-span-2 rounded-xl bg-slate-900 text-white py-2.5 hover:bg-slate-800">
            Create task
          </button>

          <div className="md:col-span-2 text-xs text-slate-500 dark:text-slate-400">
            Tip: Hold <b>Ctrl</b> to select multiple users.
          </div>
        </form>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">All tasks</h3>
          {loading && <span className="text-sm text-slate-500">Loading...</span>}
        </div>

        <div className="mt-4 space-y-3">
          {tasks.map((t) => (
            <div
              key={t._id}
              className="border border-slate-200 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {t.title}
                  </div>

                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Status: {t.status} • Priority: {t.priority}
                  </div>

                  <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                    <span className="font-semibold">Assigned to:</span>{" "}
                    {(t.assignedTo || []).map((u) => u.name).join(", ") || "—"}
                  </div>

                  {t.dueDate && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Due: {new Date(t.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <button onClick={() => deleteTask(t._id)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </div>

              {/* ✅ Upload files */}
              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  Attach reference files (PDF/DOC/Images)
                </div>

                <input
                  type="file"
                  multiple
                  onChange={(e) => uploadFiles(t._id, e.target.files)}
                  className="text-sm text-slate-700 dark:text-slate-200"
                />

                {/* ✅ Show files */}
                <div className="mt-3 space-y-1">
                  {(t.attachments || []).map((a) => (
                    <a
                      key={a._id || a.filename}
                      href={`http://localhost:5000/uploads/${a.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {a.originalname}
                    </a>
                  ))}
                  {!t.attachments?.length && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      No attachments yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!tasks.length && !loading && (
            <div className="text-slate-500 dark:text-slate-400">No tasks yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
