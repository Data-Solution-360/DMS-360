"use client";

import { Database } from "lucide-react";

export default function SearchHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search History</h1>
          <p className="text-gray-600">
            View and manage previous search queries and results.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-gray-500">
          Search history interface will be implemented here.
        </p>
      </div>
    </div>
  );
}
