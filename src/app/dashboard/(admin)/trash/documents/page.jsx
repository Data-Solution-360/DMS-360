"use client";

import DocumentTrashbox from "@/components/features/dashboard/Trashbox/DocumentTrashbox";
import { FileText } from "lucide-react";

export default function DeletedDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Deleted Documents
          </h1>
          <p className="text-gray-600">
            Restore or permanently delete removed documents.
          </p>
        </div>
      </div>

      <DocumentTrashbox />
    </div>
  );
}
