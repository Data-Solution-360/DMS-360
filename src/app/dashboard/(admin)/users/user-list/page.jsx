"use client";

import { Shield } from "lucide-react";
import { UserManagement } from "../../../../../components/features/admin";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User List</h1>
          <p className="text-gray-600">
            Assign and manage user roles and permissions.
          </p>
        </div>
      </div>

      <div className="rounded-lg border">
        <UserManagement />
      </div>
    </div>
  );
}
