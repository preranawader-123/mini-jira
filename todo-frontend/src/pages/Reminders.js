import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function toLocalDT(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function Reminders() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // form
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [visibility, setVisibility] = useState("private");
  const [remindAt, setRemindAt] = useState(toLocalDT(Date.now() + 60 * 60 * 1000));

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/reminders");
      setItems(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ FIX: use setError (not setErr)
  const createReminder = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/reminders", {
        title,
        note,
        priority,
        visibility: isAdmin ? visibility : "private",
        remindAt: new Date(remindAt).toISOString(),
      });

      setTitle("");
      setNote("");
      setPriority("Normal");
      setVisibility("private");
      setRemindAt(toLocalDT(Date.now() + 60 * 60 * 1000)); // optional reset
      await load();
    } catch (e2) {
      const status = e2?.response?.status;
      const msg = e2?.response?.data?.message || "Failed to create reminder";
      setError(status ? `${msg} (HTTP ${status})` : msg);
    }
  };

  const toggleDone = async (r) => {
    setError("");
    try {
      await api.put(`/reminders/${r._id}`, { isDone: !r.isDone });
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update reminder");
    }
  };

  const deleteReminder = async (id) => {
    if (!window.confirm("Delete this reminder?")) return;
    setError("");
    try {
      await api.delete(`/reminders/${id}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete reminder");
    }
  };

  // ✅ Simple in-app alert when time is reached (basic)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const due = (items || []).find(
        (x) => !x.isDone && new Date(x.remindAt).getTime() <= now
      );
      if (due) {
        alert(`Reminder: ${due.title}`);
      }
    }, 30000); // check every 30 seconds
    return () => clearInterval(timer);
  }, [items]);

  return (
    <div className="grid gap-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Reminder
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Add important dates and get in-app reminders.
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

        {error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
            {error}
          </div>
        )}

        <form onSubmit={createReminder} className="mt-6 grid md:grid-cols-2 gap-3">
          <input
            className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            placeholder="Reminder title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Remind At</div>
            <input
              type="datetime-local"
              className="w-full border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
              required
            />
          </div>

          <textarea
            className="md:col-span-2 border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />

          <select
            className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
          </select>

          <select
            className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            disabled={!isAdmin}
            title={!isAdmin ? "Employees can only create private reminders" : ""}
          >
            <option value="private">private</option>
            <option value="admin">admin</option>
          </select>

          <button className="md:col-span-2 rounded-xl bg-slate-900 text-white py-2.5 hover:bg-slate-800">
            Create reminder
          </button>
        </form>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">All reminders</h3>
          {loading && <span className="text-sm text-slate-500">Loading...</span>}
        </div>

        <div className="mt-4 space-y-3">
          {items.map((r) => (
            <div
              key={r._id}
              className="border border-slate-200 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {r.isDone ? <span className="line-through">{r.title}</span> : r.title}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    ⏰ {new Date(r.remindAt).toLocaleString()} • Priority: {r.priority}
                    {isAdmin ? ` • Visibility: ${r.visibility}` : ""}
                  </div>
                  {r.note && (
                    <div className="text-sm text-slate-700 dark:text-slate-200 mt-2">
                      {r.note}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => toggleDone(r)}
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {r.isDone ? "Undo" : "Done"}
                  </button>
                  <button
                    onClick={() => deleteReminder(r._id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!items.length && !loading && (
            <div className="text-slate-500 dark:text-slate-400">No reminders yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
