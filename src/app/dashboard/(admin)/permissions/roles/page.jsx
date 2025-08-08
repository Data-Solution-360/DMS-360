"use client";

import { Shield } from "lucide-react";

export default function RoleManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">
            Create and manage user roles with specific permissions.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-gray-500">
          Role management interface will be implemented here.
        </p>
      </div>
    </div>
  );
}
