"use client";

import SavedSearch from "@/components/features/dashboard/Search/SavedSearch";
import { BookOpen } from "lucide-react";

export default function SavedSearchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Searches</h1>
          <p className="text-gray-600">
            Access and manage your frequently used search queries.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <SavedSearch />
      </div>
    </div>
  );
}
