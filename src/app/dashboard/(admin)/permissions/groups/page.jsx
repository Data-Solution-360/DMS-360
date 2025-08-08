"use client";

import { Users } from "lucide-react";

export default function PermissionGroupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permission Groups</h1>
          <p className="text-gray-600">Manage user groups with shared permissions.</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-gray-500">Permission groups interface will be implemented here.</p>
      </div>
    </div>
  );
}
