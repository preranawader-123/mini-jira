import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Inbox() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      if (user?.role === "admin") {
        // ✅ add timestamp to avoid any caching
        const res = await api.get(`/inbox/admin?ts=${Date.now()}`);
        setItems(res.data || []);
        setLastUpdated(new Date());
      } else {
        setItems([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load inbox");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await load();
  };

  useEffect(() => {
    if (!user?.role) return;
    load();

    // ✅ auto refresh every 10 sec for admin
    let timer = null;
    if (user?.role === "admin") {
      timer = setInterval(() => {
        load();
      }, 10000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  return (
    <div className="grid gap-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Inbox
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Latest updates from all tasks (comments, status changes, file uploads).
            </p>
            {lastUpdated && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`text-sm px-4 py-2 rounded-xl border 
              ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50"}
              border-slate-200 bg-white
              dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-200`}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
            {error}
          </div>
        )}

        {user?.role !== "admin" ? (
          <div className="mt-6 text-slate-500 dark:text-slate-400">
            Only admin can view inbox.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((a) => (
              <div
                key={a._id}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50
                           dark:bg-slate-950 dark:border-slate-800"
              >
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-semibold">{a.actor?.name || "User"}</span>{" "}
                  <span className="text-slate-500 dark:text-slate-400">
                    ({a.actor?.role})
                  </span>{" "}
                  • <span className="font-semibold">{a.type}</span>
                </div>

                <div className="text-sm text-slate-900 dark:text-slate-100 mt-1">
                  Task: {a.task?.title || "—"}
                </div>

                {a.type === "comment" && (
                  <div className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                    “{a.message}”
                  </div>
                )}

                {a.type === "status" && (
                  <div className="text-sm text-slate-700 dark:text-slate-200 mt-1">
                    {a.message}
                  </div>
                )}

                {a.type === "file" && (
                  <div className="text-sm mt-1">
                    <span className="text-slate-700 dark:text-slate-200">
                      {a.file?.originalname || "File attached"}
                    </span>
                    {a.file?.filename && (
                      <a
                        href={`http://localhost:5000/uploads/${a.file.filename}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Open
                      </a>
                    )}
                  </div>
                )}

                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {new Date(a.createdAt).toLocaleString()}
                </div>
              </div>
            ))}

            {!items.length && !loading && (
              <div className="text-slate-500 dark:text-slate-400">
                No updates yet.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
