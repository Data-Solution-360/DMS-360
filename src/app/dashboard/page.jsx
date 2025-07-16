"use client";

import { useEffect } from "react";
import {
  DashboardContent,
  DashboardLayout,
} from "../../components/features/dashboard";
import {
  testFirebaseStorageConnection,
  testFirebaseUpload,
} from "../../lib/firebaseUpload";
import { useAuth } from "../../store";

export default function DashboardPage(props) {
  useEffect(() => {
    console.log("[Debug] useEffect running in DashboardPage");
    testFirebaseStorageConnection();
    testFirebaseUpload();
  }, []);
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
