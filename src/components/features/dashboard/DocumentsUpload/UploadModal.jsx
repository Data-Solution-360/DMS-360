"use client";

import Modal from "react-modal";
import DocumentUploadWithTags from "./DocumentUpload";

export default function UploadModal({
  selectedFolder,
  onClose,
  onUploadSuccess,
  maxWidth = "max-w-4xl", // Make it configurable
  showFolderInfo = true,
  isOpen = true, // Add isOpen prop to match react-modal pattern
}) {
  const handleClose = () => {
    onClose();
  };

  const handleUploadSuccess = (successfulUploads) => {
    // Call the parent's onUploadSuccess callback
    if (onUploadSuccess) {
      onUploadSuccess(successfulUploads);
    }

    // Close the modal after successful upload
    // The alert will be shown by the DocumentUpload component
    setTimeout(() => {
      handleClose();
    }, 500); // Small delay to ensure the alert is shown before closing
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Upload Documents"
      overlayClassName="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      className={`bg-white rounded-lg shadow-2xl w-full ${maxWidth} mx-4 max-h-[90vh] overflow-hidden outline-none border border-gray-200`}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
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
            <h2 className="text-2xl font-bold text-gray-800">
              Upload Documents
            </h2>
            {showFolderInfo && (
              <p className="text-sm text-gray-600">
                {selectedFolder?.name
                  ? `Upload to ${selectedFolder.name}`
                  : "Upload to root directory"}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span className="text-2xl">✕</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 bg-white overflow-y-auto max-h-[calc(90vh-140px)]">
        <DocumentUploadWithTags
          folderId={selectedFolder?.id}
          onClose={handleClose}
          onUploadSuccess={handleUploadSuccess}
          onCancel={handleClose}
        />
      </div>
    </Modal>
  );
}
