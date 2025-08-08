"use client";

import { Eye } from "lucide-react";

export default function CompanyProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Eye className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600">Manage company information and organizational details.</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-gray-500">Company profile interface will be implemented here.</p>
      </div>
    </div>
  );
}