import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider, useAuth } from "./contexts/authContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import AllTodos from "./pages/Todos/AllTodos";
import TodayTodos from "./pages/Todos/TodayTodos";
import CompletedTodos from "./pages/Todos/CompletedTodos";
import OverdueTodos from "./pages/Todos/OverdueTodos";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUser";
import AdminTodos from "./pages/Admin/AdminTodo";
import AdminReports from "./pages/Admin/AdminReports";
import "./App.scss";
import Profile from "./pages/Profile/Profile";

// Add this to your admin navigation/routing
import AdminTaskAssignment from "./pages/Admin/AdminTaskAssignment";

// Add route for task assignment

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === "admin" ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="todos" element={<AllTodos />} />
          <Route path="today" element={<TodayTodos />} />
          <Route path="completed" element={<CompletedTodos />} />
          <Route path="overdue" element={<OverdueTodos />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="admin/todos"
            element={
              <AdminRoute>
                <AdminTodos />
              </AdminRoute>
            }
          />
          <Route
            path="admin/reports"
            element={
              <AdminRoute>
                <AdminReports />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/assign-task"
            element={
              <AdminRoute>
                <AdminTaskAssignment />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
