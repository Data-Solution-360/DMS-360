"use client";

import {
  DashboardContent,
  DashboardLayout,
} from "../../components/features/dashboard";
import { useAuth } from "../../store";

export default function DashboardPage(props) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <DashboardContent user={user} />
    </DashboardLayout>
  );
}
