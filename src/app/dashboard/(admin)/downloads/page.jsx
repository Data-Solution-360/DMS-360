"use client";

import DownloadHistory from "@/components/features/dashboard/DownloadHistory/DownloadHistory";
import { Download } from "lucide-react";

export default function DownloadHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Download className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Download History</h1>
          <p className="text-gray-600">
            Track and monitor all document download activities.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <DownloadHistory />
      </div>
    </div>
  );
}
