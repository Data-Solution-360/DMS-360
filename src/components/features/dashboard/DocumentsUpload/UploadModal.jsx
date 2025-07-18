"use client";

import DocumentUploadWithTags from "./DocumentUpload";

// Professional close icon
const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function UploadModal({
  selectedFolder,
  onClose,
  onUploadSuccess,
  maxWidth = "max-w-6xl", // Make it configurable
  showFolderInfo = true,
}) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl shadow-2xl ${maxWidth} w-full max-h-[95vh] overflow-hidden border border-gray-700 bg-gray-900`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Upload Documents
              </h2>
              {showFolderInfo && (
                <p className="text-sm text-gray-300">
                  {selectedFolder?.name
                    ? `Upload to ${selectedFolder.name}`
                    : "Upload to root directory"}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-all duration-200 text-gray-400 hover:text-white"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <DocumentUploadWithTags
            folderId={selectedFolder?.id}
            onClose={onClose}
            onUploadSuccess={onUploadSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
