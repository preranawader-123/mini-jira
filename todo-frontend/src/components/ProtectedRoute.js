import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, token } = useAuth();
  const location = useLocation();

  // ✅ If no token/user, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // ✅ Role-based block
  if (role && user.role !== role) {
    // If employee tries admin route, send them to tasks
    return <Navigate to="/tasks" replace />;
  }

  return children;
}
