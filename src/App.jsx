import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/auth/Register";
import CheckEmail from "./pages/auth/CheckEmail";
import Activate from "./pages/auth/Activate";
import Login from "./pages/auth/Login";
import SelectRole from "./pages/auth/SelectRole";
import TeacherDashboard from "./pages/teacher/Dashboard";
import StudentDashboard from "./pages/student/Dashboard";
import Batches from "./pages/teacher/Batches";
import Notifications from "./pages/Notifications";
import Subscription from "./pages/teacher/Subscription";
import Payments from "./pages/student/Payments";
import MyBatches from "./pages/student/MyBatches";
import JoinPage from "./pages/student/JoinPage";
import RoomPage from "./pages/room/RoomPage";
import Plans from "./pages/teacher/Plans";
import Checkout from "./pages/teacher/Checkout";
import Profile from "./pages/teacher/Profile";
import BulkSms from "./pages/teacher/BulkSms";
import SmsRecharge from "./pages/teacher/SmsRecharge";
function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.role) return <Navigate to="/select-role" replace />;
  return (
    <Navigate to={user.role === "TEACHER" ? "/teacher" : "/student"} replace />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/activate/:uid/:token" element={<Activate />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/select-role"
            element={
              <ProtectedRoute role="NONE">
                <SelectRole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute role="TEACHER">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/batches"
            element={
              <ProtectedRoute role="TEACHER">
                <Batches />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/join" element={<JoinPage />} />
          <Route
            path="/student/batches"
            element={
              <ProtectedRoute role="STUDENT">
                <MyBatches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/batches/:id"
            element={
              <ProtectedRoute role="TEACHER">
                <RoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/batches/:id"
            element={
              <ProtectedRoute role="STUDENT">
                <RoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/subscription"
            element={
              <ProtectedRoute role="TEACHER">
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/payments"
            element={
              <ProtectedRoute role="STUDENT">
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/plans"
            element={
              <ProtectedRoute role="TEACHER">
                <Plans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/checkout/:planId"
            element={
              <ProtectedRoute role="TEACHER">
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
  path="/teacher/profile"
  element={
    <ProtectedRoute role="TEACHER">
      <Profile />
    </ProtectedRoute>
  }
/>
<Route path="/teacher/sms" element={
  <ProtectedRoute role="TEACHER"><BulkSms /></ProtectedRoute>
} />
<Route path="/teacher/sms/recharge" element={
  <ProtectedRoute role="TEACHER"><SmsRecharge /></ProtectedRoute>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}