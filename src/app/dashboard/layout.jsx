"use client";

import ProtectedRoute from "../../components/auth/ProtectedRoute";
import DashboardFormat from "../../components/layout/dashboard/DashboardFormat";
import { useAuth } from "../../store/AuthContext"; // Updated import path

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute redirectTo="/login">
      <DashboardFormat user={user} onLogout={handleLogout}>
        {children}
      </DashboardFormat>
    </ProtectedRoute>
  );
} 