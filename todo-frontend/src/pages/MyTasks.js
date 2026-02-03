import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function MyTasks() {
  const { user } = useAuth();
  const myId = user?.id || user?._id;

  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  // edit state
  const [editing, setEditing] = useState({ taskId: "", commentId: "" });
  const [editText, setEditText] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await api.get("/tasks/my");
      setTasks(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load tasks");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (taskId, status) => {
    setError("");
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update status");
    }
  };

  const addComment = async (taskId, text) => {
    if (!text.trim()) return;
    setError("");
    try {
      await api.post(`/tasks/${taskId}/comments`, { text });
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to add comment");
    }
  };

  const startEdit = (taskId, comment) => {
    setEditing({ taskId, commentId: comment._id });
    setEditText(comment.text || "");
  };

  const cancelEdit = () => {
    setEditing({ taskId: "", commentId: "" });
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editing.taskId || !editing.commentId) return;
    if (!editText.trim()) return;

    setError("");
    try {
      await api.patch(`/tasks/${editing.taskId}/comments/${editing.commentId}`, {
        text: editText.trim(),
      });
      cancelEdit();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to edit comment");
    }
  };

  const deleteComment = async (taskId, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    setError("");
    try {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete comment");
    }
  };

  const uploadFiles = async (taskId, fileList) => {
    if (!fileList || fileList.length === 0) return;

    setError("");
    const fd = new FormData();
    Array.from(fileList).forEach((f) => fd.append("files", f));

    try {
      await api.post(`/tasks/${taskId}/files`, fd);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "File upload failed");
    }
  };

  return (
    <div className="grid gap-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">My tasks</h2>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Logged as {user?.name} ({user?.role})
          </div>
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-4">
          {tasks.map((t) => (
            <div
              key={t._id}
              className="border border-slate-200 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{t.title}</div>

                  {t.description && (
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {t.description}
                    </div>
                  )}

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Priority: {t.priority} • Status: {t.status}
                  </div>

                  <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                    <span className="font-semibold">Assigned to:</span>{" "}
                    {(t.assignedTo || []).map((u) => u.name).join(", ") || "—"}
                  </div>
                </div>

                <select
                  className="border rounded-xl px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
                  value={t.status}
                  onChange={(e) => updateStatus(t._id, e.target.value)}
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>

              {/* Attachments */}
              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Attachments
                </div>

                <div className="mt-2 space-y-1">
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
                    <div className="text-sm text-slate-500 dark:text-slate-400">No attachments yet.</div>
                  )}
                </div>

                <div className="mt-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Add files (PDF/DOC/Images)
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => uploadFiles(t._id, e.target.files)}
                    className="text-sm text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Comments */}
              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  Comments / Daily updates
                </div>

                <CommentBox onAdd={(text) => addComment(t._id, text)} />

                <div className="mt-3 space-y-2">
                  {(t.comments || [])
                    .slice()
                    .reverse()
                    .map((c) => {
                      const ownerId = c?.user?._id || c?.user?.id;
                      const canManage =
                        user?.role === "admin" || String(ownerId) === String(myId);

                      const isEditing =
                        editing.taskId === t._id && editing.commentId === c._id;

                      return (
                        <div
                          key={c._id}
                          className="border border-slate-200 rounded-xl p-3 bg-white
                                     dark:bg-slate-900 dark:border-slate-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 text-sm text-slate-700 dark:text-slate-200">
                              {!isEditing ? (
                                <>
                                  {c.text}{" "}
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    — {c.user?.name || "User"}
                                  </span>
                                </>
                              ) : (
                                <div className="space-y-2">
                                  <input
                                    className="w-full border rounded-xl px-3 py-2 text-sm
                                               dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={saveEdit}
                                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs hover:bg-slate-800"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="px-3 py-1.5 rounded-xl border text-xs
                                                 dark:border-slate-700 dark:text-slate-200"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {canManage && !isEditing && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => startEdit(t._id, c)}
                                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => deleteComment(t._id, c._id)}
                                  className="text-xs text-red-600 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {!t.comments?.length && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">No updates yet.</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!tasks.length && (
            <div className="text-slate-500 dark:text-slate-400">No tasks assigned yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function CommentBox({ onAdd }) {
  const [text, setText] = useState("");

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 border rounded-xl px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
        placeholder="Add update..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => {
          onAdd(text);
          setText("");
        }}
        className="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:bg-slate-800"
      >
        Send
      </button>
    </div>
  );
}
