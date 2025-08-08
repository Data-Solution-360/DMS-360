"use client";

import { Activity } from "lucide-react";

export default function UserUsagePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Usage</h1>
          <p className="text-gray-600">Monitor user activity and system usage statistics.</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-gray-500">Usage analytics interface will be implemented here.</p>
      </div>
    </div>
  );
}
