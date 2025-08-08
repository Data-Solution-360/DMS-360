"use client";

import { Lock } from "lucide-react";

export default function AccessControlPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Lock className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
          <p className="text-gray-600">Configure access permissions for documents and folders.</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-gray-500">Access control interface will be implemented here.</p>
      </div>
    </div>
  );
}
