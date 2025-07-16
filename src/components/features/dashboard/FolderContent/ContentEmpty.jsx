"use client";

// Temporary icon replacements
const FiFile = () => <span>📄</span>;
const FiUpload = () => <span>📤</span>;

export default function ContentEmpty({ type, onUpload }) {
  const getContent = () => {
    switch (type) {
      case "select":
        return {
          icon: <FiFile className="h-12 w-12 text-sky-300" />,
          title: "Select a folder",
          description: "Choose a folder from the sidebar to view its contents",
          showButton: false,
        };
      case "empty":
        return {
          icon: <FiFile className="h-12 w-12 text-sky-300" />,
          title: "No content yet",
          description:
            "This folder is empty. Upload documents or create subfolders to get started",
          showButton: true,
        };
      default:
        return {
          icon: <FiFile className="h-12 w-12 text-sky-300" />,
          title: "No content",
          description: "No content available",
          showButton: false,
        };
    }
  };

  const content = getContent();

  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
        {content.icon}
      </div>
      <h3 className="text-xl font-bold text-white/90 mb-2">{content.title}</h3>
      <p className="text-white/60 mb-6">{content.description}</p>
      {content.showButton && (
        <button
          onClick={onUpload}
          className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105"
        >
          <FiUpload className="inline-block mr-2" />
          Upload Document
        </button>
      )}
    </div>
  );
}
