// src/components/features/dashboard/FolderSidebar/components/EditFolderModal.jsx

"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useApi } from "../../../../../hooks/useApi";
import { FolderIcons } from "../utils/constants";

const EditFolderModal = ({ isOpen, folder, onClose, onEdit }) => {
  const [folderName, setFolderName] = useState(folder?.name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const { apiCall } = useApi(); // Changed from 'request' to 'apiCall'

  useEffect(() => {
    setFolderName(folder?.name || "");
  }, [folder]);

  if (!isOpen || !folder) return null;

  const handleEdit = async () => {
    if (!folderName.trim()) return;

    setIsUpdating(true);

    try {
      const response = await apiCall(`/api/folders/${folder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: folderName.trim(),
        }),
      });

      if (response.success) {
        await Swal.fire({
          title: "Success!",
          text: "Folder updated successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        // Call the onEdit callback to refresh the UI
        onEdit(folder, folderName.trim());
        onClose();
      } else {
        throw new Error(response.error || "Failed to update folder");
      }
    } catch (error) {
      console.error("Update folder error:", error);
      await Swal.fire({
        title: "Error!",
        text: error.message || "Failed to update folder",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-white/20 max-w-lg w-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Edit Folder</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <FolderIcons.Close className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 p-6">
          <label className="block text-sm font-medium text-white/80 mb-3">
            Folder Name
          </label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
            autoFocus
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleEdit();
              }
            }}
          />
        </div>
        <div className="flex space-x-4 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            disabled={!folderName.trim() || isUpdating}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFolderModal;
