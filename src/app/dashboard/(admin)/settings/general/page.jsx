"use client";

import { Settings } from "lucide-react";

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
          <p className="text-gray-600">Configure basic system settings and preferences.</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-gray-500">General settings interface will be implemented here.</p>
      </div>
    </div>
  );
}