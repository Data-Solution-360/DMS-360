"use client";

import { DashboardContent } from "@/components/features";
import { FileText } from "lucide-react";

export default function MainContentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Main Contents</h1>
          <p className="text-gray-600">
            Overview and management of all document contents.
          </p>
        </div>
      </div>

      <div>
        <DashboardContent />
      </div>
    </div>
  );
}
