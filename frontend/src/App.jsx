import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Loader from "./components/common/Loader";

// Pages
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const IrrigationControl = React.lazy(() => import("./pages/IrrigationControl"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Community = React.lazy(() => import("./pages/Community"));
const CommunityHub = React.lazy(() => import("./pages/CommunityHub"));
const CommunityLeaderboard = React.lazy(
  () => import("./pages/CommunityLeaderboard"),
);
const FarmerGroups = React.lazy(() => import("./pages/FarmerGroups"));
const GroupDetail = React.lazy(() => import("./pages/GroupDetail"));
const AIAssistant = React.lazy(() => import("./pages/AIAssistant"));
const DeviceConnection = React.lazy(() => import("./pages/DeviceConnection"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = React.lazy(() => import("./pages/AdminUsers"));
const AdminOrders = React.lazy(() => import("./pages/AdminOrders"));
const AdminPayments = React.lazy(() => import("./pages/AdminPayments"));
const AdminDevices = React.lazy(() => import("./pages/AdminDevices"));
const AdminMonitor = React.lazy(() => import("./pages/AdminMonitor"));
const AdminSystems = React.lazy(() => import("./pages/AdminSystems"));
const AdminMapView = React.lazy(() => import("./pages/AdminMapView"));
const AdminAlerts = React.lazy(() => import("./pages/AdminAlerts"));
const AdminSystemDetails = React.lazy(
  () => import("./pages/AdminSystemDetails"),
);
const ShopDevices = React.lazy(() => import("./pages/ShopDevices"));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#fff",
                  color: "#374151",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  borderRadius: "8px",
                  padding: "16px",
                },
                success: {
                  iconTheme: {
                    primary: "#22c55e",
                    secondary: "#fff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />

            <Suspense fallback={<Loader fullScreen />}>
              <Routes>
                {/* Public Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/irrigation"
                  element={
                    <ProtectedRoute>
                      <IrrigationControl />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                {/* Community Platform Routes */}
                <Route
                  path="/community"
                  element={
                    <ProtectedRoute>
                      <CommunityHub />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/discussions"
                  element={
                    <ProtectedRoute>
                      <Community />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/leaderboard"
                  element={
                    <ProtectedRoute>
                      <CommunityLeaderboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/groups"
                  element={
                    <ProtectedRoute>
                      <FarmerGroups />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/community/groups/:id"
                  element={
                    <ProtectedRoute>
                      <GroupDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-assistant"
                  element={
                    <ProtectedRoute>
                      <AIAssistant />
                    </ProtectedRoute>
                  }
                />{" "}
                <Route
                  path="/devices"
                  element={
                    <ProtectedRoute>
                      <DeviceConnection />
                    </ProtectedRoute>
                  }
                />{" "}
                <Route
                  path="/shop"
                  element={
                    <ProtectedRoute>
                      <ShopDevices />
                    </ProtectedRoute>
                  }
                />
                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrders />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/payments"
                  element={
                    <AdminRoute>
                      <AdminPayments />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/devices"
                  element={
                    <AdminRoute>
                      <AdminDevices />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/monitor"
                  element={
                    <AdminRoute>
                      <AdminMonitor />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/panel"
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/systems"
                  element={
                    <AdminRoute>
                      <AdminSystems />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/map"
                  element={
                    <AdminRoute>
                      <AdminMapView />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/alerts"
                  element={
                    <AdminRoute>
                      <AdminAlerts />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/system/:id"
                  element={
                    <AdminRoute>
                      <AdminSystemDetails />
                    </AdminRoute>
                  }
                />
                {/* Redirect - No opening page, straight to dashboard */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </Suspense>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
