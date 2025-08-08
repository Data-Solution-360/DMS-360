"use client";

import AdvanceSearch from "@/components/features/dashboard/Search/AdvanceSearch";
import { Search } from "lucide-react";

export default function AdvancedSearchPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Search className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Search</h1>
          <p className="text-gray-600">
            Perform detailed searches across all documents and folders.
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-6">
        <AdvanceSearch />
      </div>
    </div>
  );
}
