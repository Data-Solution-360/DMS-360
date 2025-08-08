"use client";

import { Users } from "lucide-react";
import UserTrashbox from "@/components/features/dashboard/Trashbox/UserTrashbox";

export default function DeletedUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deleted Users</h1>
          <p className="text-gray-600">Restore or permanently delete removed user accounts.</p>
        </div>
      </div>

      <UserTrashbox />
    </div>
  );
}
