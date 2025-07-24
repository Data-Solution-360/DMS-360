"use client";

import ProtectedRoute from "../../components/auth/ProtectedRoute";
import {
  DashboardContent,
  DashboardLayout,
} from "../../components/features/dashboard";
import { useAuth } from "../../store";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // The logout function now handles redirection automatically
  };

  return (
    <ProtectedRoute redirectTo="/login">
      <DashboardLayout user={user} onLogout={handleLogout}>
        <DashboardContent user={user} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
