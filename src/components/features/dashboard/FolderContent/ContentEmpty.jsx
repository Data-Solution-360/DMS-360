"use client";

// Temporary icon replacements
const FiFile = () => <span>📄</span>;
const FiUpload = () => <span>📤</span>;

export default function ContentEmpty({ type, onUpload, message }) {
  const getContent = () => {
    switch (type) {
      case "select":
        return {
          icon: <FiFile className="h-8 w-8 text-gray-400" />,
          title: "Select a folder",
          description: "Choose a folder from the sidebar to view its contents",
          showButton: false,
        };
      case "empty":
        return {
          icon: <FiFile className="h-8 w-8 text-gray-400" />,
          title: "No content yet",
          description:
            message ||
            "This folder is empty. Upload documents or create subfolders to get started",
          showButton: true,
        };
      case "empty_folder_list":
        return {
          icon: <FiFile className="h-8 w-8 text-gray-400" />,
          title: "No folders yet",
          description:
            message || "This folder is empty. Create a folder to get started",
          showButton: true,
        };
      default:
        return {
          icon: <FiFile className="h-8 w-8 text-gray-400" />,
          title: "No content",
          description: message || "No content available",
          showButton: false,
        };
    }
  };

  const content = getContent();

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
        {content.icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {content.title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {content.description}
      </p>
      {content.showButton && type === "empty" && (
        <button
          onClick={onUpload}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <FiUpload className="inline-block mr-2" />
          Upload Document
        </button>
      )}
      {content.showButton && type === "empty_folder_list" && (
        <button
          onClick={onUpload}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <FiUpload className="inline-block mr-2" />
          Create Folder
        </button>
      )}
    </div>
  );
}
