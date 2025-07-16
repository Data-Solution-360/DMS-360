"use client";

import { DocumentUploadWithTags } from "../../documents";

// Temporary icon replacements
const FiX = () => <span>✕</span>;

export default function UploadModal({
  selectedFolder,
  onClose,
  onUploadSuccess,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Documents to {selectedFolder?.name || "Selected Folder"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <DocumentUploadWithTags
            folderId={selectedFolder?.id}
            onClose={onClose}
            onUploadSuccess={onUploadSuccess}
          />
        </div>
      </div>
    </div>
  );
}
