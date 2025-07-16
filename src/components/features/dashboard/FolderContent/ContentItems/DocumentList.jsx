"use client";

// Temporary icon replacements
const FiDownload = () => <span>📥</span>;
const FiEye = () => <span>👁️</span>;
const FiMoreVertical = () => <span>⋮</span>;

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getFileIcon = (mimeType) => {
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return "📊";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return "📈";
  if (mimeType.includes("image")) return "🖼️";
  if (mimeType.includes("video")) return "🎥";
  if (mimeType.includes("audio")) return "🎵";
  if (mimeType.includes("zip") || mimeType.includes("archive")) return "📦";
  return "📄";
};

export default function DocumentList({ document, onAction }) {
  return (
    <div className="group relative flex items-center p-4 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 transition-all duration-300 border border-white/10 hover:border-white/20">
      {/* Document icon */}
      <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-sky-500/50 transition-all duration-300">
        <span className="h-6 w-6 text-white">
          {getFileIcon(document.mimeType)}
        </span>
      </div>

      {/* Document info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors duration-300 truncate">
          {document.originalName}
        </h3>
        <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300 truncate">
          {document.mimeType}
        </p>
        <div className="flex items-center space-x-4 mt-1 text-xs text-white/60">
          <span>{formatFileSize(document.size)}</span>
          <span>{formatDate(document.createdAt)}</span>
          {document.tags && document.tags.length > 0 && (
            <span className="text-emerald-300">
              {document.tags.length} tags
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => onAction("view", document)}
          className="p-2 rounded-lg bg-white/10 hover:bg-sky-500/20 text-white/70 hover:text-sky-300 transition-all duration-300"
          title="View"
        >
          <FiEye className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAction("download", document)}
          className="p-2 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-300 transition-all duration-300"
          title="Download"
        >
          <FiDownload className="h-4 w-4" />
        </button>
        <button
          onClick={() => onAction("more", document)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-300"
          title="More options"
        >
          <FiMoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
