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

export default function Meetings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // form
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState(toLocalDT(Date.now() + 60 * 60 * 1000));
  const [endAt, setEndAt] = useState(toLocalDT(Date.now() + 2 * 60 * 60 * 1000));

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/meetings");
      setItems(res.data || []);
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e.message || "Failed to load meetings";
      setErr(status ? `${msg} (HTTP ${status})` : msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createMeeting = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setErr("");
    try {
      await api.post("/meetings", {
        title,
        agenda,
        location,
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        attendees: []
      });

      setTitle("");
      setAgenda("");
      setLocation("");
      await load();
    } catch (e2) {
      const status = e2?.response?.status;
      const msg = e2?.response?.data?.message || "Failed to create meeting";
      setErr(status ? `${msg} (HTTP ${status})` : msg);
    }
  };

  const deleteMeeting = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this meeting?")) return;

    setErr("");
    try {
      await api.delete(`/meetings/${id}`);
      await load();
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || "Failed to delete meeting";
      setErr(status ? `${msg} (HTTP ${status})` : msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Meeting Scheduler
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              {isAdmin
                ? "Create and manage meetings."
                : "Employees will see meetings when attendees feature is enabled."}
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

        {/* Create meeting (Admin only) */}
        {isAdmin && (
          <form onSubmit={createMeeting} className="mt-6 grid md:grid-cols-2 gap-3">
            <input
              className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              placeholder="Meeting title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              className="border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              placeholder="Location / Link (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <textarea
              className="md:col-span-2 border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
              placeholder="Agenda (optional)"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              rows={2}
            />

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Start</div>
              <input
                type="datetime-local"
                className="w-full border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">End</div>
              <input
                type="datetime-local"
                className="w-full border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                required
              />
            </div>

            <button className="md:col-span-2 rounded-xl bg-slate-900 text-white py-2.5 hover:bg-slate-800">
              Create meeting
            </button>
          </form>
        )}
      </div>

      {/* List Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Upcoming meetings</h3>
          {loading && <span className="text-sm text-slate-500">Loading...</span>}
        </div>

        <div className="mt-4 space-y-3">
          {items.map((m) => (
            <div
              key={m._id}
              className="border border-slate-200 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {m.title}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    {new Date(m.startAt).toLocaleString()} → {new Date(m.endAt).toLocaleString()}
                  </div>

                  {m.location && (
                    <div className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                      📍 {m.location}
                    </div>
                  )}

                  {m.agenda && (
                    <div className="text-sm text-slate-700 dark:text-slate-200 mt-2">
                      {m.agenda}
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <button
                    onClick={() => deleteMeeting(m._id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}

          {!items.length && !loading && (
            <div className="text-slate-500 dark:text-slate-400">No meetings yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
