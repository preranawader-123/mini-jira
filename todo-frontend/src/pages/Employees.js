import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Reset password modal state
  const [passOpen, setPassOpen] = useState(false);
  const [passUser, setPassUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const loadEmployees = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await api.get("/admin/users/employees");
      setEmployees(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openEdit = (u) => {
    setEditUser(u);
    setEditName(u.name || "");
    setEditEmail(u.email || "");
    setEditOpen(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.put(`/admin/users/${editUser._id}`, {
        name: editName,
        email: editEmail,
      });

      // update list locally
      setEmployees((prev) =>
        prev.map((x) => (x._id === editUser._id ? res.data : x))
      );

      setEditOpen(false);
      setEditUser(null);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to update employee");
    }
  };

  const openResetPassword = (u) => {
    setPassUser(u);
    setNewPassword("");
    setPassOpen(true);
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await api.put(`/admin/users/${passUser._id}/password`, {
        newPassword,
      });

      alert("Password updated successfully ✅");
      setPassOpen(false);
      setPassUser(null);
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to update password");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Employees
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Admin can edit employee details and reset passwords.
            </p>
          </div>

          <button
            onClick={loadEmployees}
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

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((u) => (
                <tr
                  key={u._id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 text-slate-900 dark:text-slate-100">
                    {u.name}
                  </td>
                  <td className="py-3 text-slate-700 dark:text-slate-200">
                    {u.email}
                  </td>
                  <td className="py-3 text-slate-700 dark:text-slate-200">
                    {u.role}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-xs px-3 py-1.5 rounded-lg border hover:bg-slate-50
                                   dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openResetPassword(u)}
                        className="text-xs px-3 py-1.5 rounded-lg border hover:bg-slate-50
                                   dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200"
                      >
                        Reset Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {employees.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="4"
                    className="py-6 text-slate-500 dark:text-slate-400"
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {loading && (
            <div className="mt-4 text-slate-500 dark:text-slate-400">
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* ✅ Edit Modal */}
      {editOpen && (
        <Modal title="Edit Employee" onClose={() => setEditOpen(false)}>
          <form onSubmit={saveEdit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">
                Name
              </label>
              <input
                className="w-full mt-1 border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">
                Email
              </label>
              <input
                type="email"
                className="w-full mt-1 border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>

            <button className="w-full rounded-xl bg-slate-900 text-white py-2.5 hover:bg-slate-800">
              Save Changes
            </button>
          </form>
        </Modal>
      )}

      {/* ✅ Reset Password Modal */}
      {passOpen && (
        <Modal
          title={`Reset Password: ${passUser?.name || ""}`}
          onClose={() => setPassOpen(false)}
        >
          <form onSubmit={resetPassword} className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400">
                New Password (min 6 chars)
              </label>
              <input
                type="password"
                className="w-full mt-1 border rounded-xl px-3 py-2 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-100"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button className="w-full rounded-xl bg-slate-900 text-white py-2.5 hover:bg-slate-800">
              Update Password
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded-lg border dark:border-slate-700 dark:text-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
