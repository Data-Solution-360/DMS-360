"use client";

// Temporary icon replacements
const FiFolder = () => <span>📁</span>;
const FiPlus = () => <span>➕</span>;

export default function FolderGridEmpty({ selectedFolder, onCreateFolder }) {
  return (
    <div className="text-center py-12">
      <FiFolder className="h-16 w-16 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-500 mb-2">
        {selectedFolder ? "No subfolders" : "No folders yet"}
      </h3>
      <p className="text-gray-400 mb-4">
        {selectedFolder
          ? "This folder is empty. Create a subfolder to get started."
          : "Create your first folder to organize your documents."}
      </p>
      <button
        onClick={onCreateFolder}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <FiPlus className="h-4 w-4 mr-2" />
        Create Folder
      </button>
    </div>
  );
}
