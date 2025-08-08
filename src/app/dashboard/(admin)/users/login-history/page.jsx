"use client";
import { LoginHistory } from "../../../../../components/features/admin";

import { Shield } from "lucide-react";

export default function LoginHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Login History</h1>
          <p className="text-gray-600">View login history for all users.</p>
        </div>
      </div>

      <div className="rounded-lg border">
        <LoginHistory />
      </div>
    </div>
  );
}
