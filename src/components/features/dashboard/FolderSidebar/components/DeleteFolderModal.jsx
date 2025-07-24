// src/components/features/dashboard/FolderSidebar/components/DeleteFolderModal.jsx

"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useApi } from "../../../../../hooks/useApi";

const DeleteFolderModal = ({ isOpen, folder, onClose, onDelete, deleting }) => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { apiCall } = useApi(); // Changed from 'request' to 'apiCall'

  useEffect(() => {
    setAcceptTerms(false);
  }, [folder, isOpen]);

  if (!isOpen || !folder) return null;

  // Handler for delete button
  const handleDelete = async () => {
    console.log("Folder to delete:", folder); // Check folder owner and permissions

    if (!acceptTerms) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      html: `This will delete <b>${folder.name}</b> and all its subfolders, documents, and files. This action cannot be undone.<br><br>
      <span class="text-red-600 font-bold">This will also delete all files from storage!</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete everything!",
      cancelButtonText: "Cancel",
      focusCancel: true,
    });

    if (result.isConfirmed) {
      setIsDeleting(true);

      try {
        const response = await apiCall(`/api/folders/${folder.id}`, {
          method: "DELETE",
        });

        if (response.success) {
          await Swal.fire({
            title: "Deleted!",
            html: `
              Successfully deleted:<br>
              • ${response.data.deletedFolders} folders<br>
              • ${response.data.deletedDocuments} documents<br>
              • ${response.data.deletedFiles} files from storage
            `,
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          });

          // Call the onDelete callback to refresh the UI
          onDelete(folder);
          onClose();
        } else {
          throw new Error(response.error || "Failed to delete folder");
        }
      } catch (error) {
        console.error("Delete folder error:", error);
        await Swal.fire({
          title: "Error!",
          text: error.message || "Failed to delete folder",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-red-600">Delete Folder</h2>
        <p className="mb-4 text-gray-800">
          Are you sure you want to delete <b>{folder.name}</b>?<br />
          This action cannot be undone.
        </p>
        <label className="flex items-center mb-4 text-gray-700">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mr-2"
          />
          I accept the{" "}
          <a href="/terms" target="_blank" className="underline">
            terms and conditions
          </a>
        </label>
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!acceptTerms || isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFolderModal;
