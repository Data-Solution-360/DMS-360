"use client";

import { FolderOpen } from "lucide-react";

export default function DeletedFoldersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderOpen className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deleted Folders</h1>
          <p className="text-gray-600">Restore or permanently delete removed folders.</p>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-gray-500">Deleted folders interface will be implemented here.</p>
      </div>
    </div>
  );
}