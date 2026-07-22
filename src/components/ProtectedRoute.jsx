import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-ink-400">
        লোড হচ্ছে…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Role এখনো set হয়নি — আগে সেটা করাও
  if (!user.role && role !== "NONE") {
    return <Navigate to="/select-role" replace />;
  }

  // Role আছে অথচ select-role page-এ যাওয়ার চেষ্টা — dashboard-এ পাঠাও
  if (user.role && role === "NONE") {
    return <Navigate to={user.role === "TEACHER" ? "/teacher" : "/student"} replace />;
  }

  // ভুল role-এর route — নিজের এলাকায় ফেরত
  if (role && role !== "NONE" && user.role !== role) {
    return <Navigate to={user.role === "TEACHER" ? "/teacher" : "/student"} replace />;
  }

  return children;
}