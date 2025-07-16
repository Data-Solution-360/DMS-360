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

export default function DocumentCard({ document, onAction }) {
  return (
    <div className="group relative bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-sky-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

      <div className="relative z-10">
        {/* Document icon */}
        <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl group-hover:shadow-sky-500/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
            {getFileIcon(document.mimeType)}
          </span>
        </div>

        {/* Document info */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white/90 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-500 line-clamp-2">
            {document.originalName}
          </h3>

          <div className="space-y-2">
            <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
              {document.mimeType}
            </p>

            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{formatFileSize(document.size)}</span>
              <span>{formatDate(document.createdAt)}</span>
            </div>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {document.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 rounded-full border border-emerald-500/30"
                  >
                    {tag}
                  </span>
                ))}
                {document.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-white/10 text-white/60 rounded-full">
                    +{document.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex space-x-2">
              <button
                onClick={() => onAction("view", document)}
                className="p-2 rounded-lg bg-white/10 hover:bg-sky-500/20 text-white/70 hover:text-sky-300 transition-all duration-300 transform hover:scale-110"
                title="View"
              >
                <FiEye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onAction("download", document)}
                className="p-2 rounded-lg bg-white/10 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-300 transition-all duration-300 transform hover:scale-110"
                title="Download"
              >
                <FiDownload className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => onAction("more", document)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-300 transform hover:scale-110"
              title="More options"
            >
              <FiMoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-sky-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
      <div className="absolute bottom-4 left-4 w-2 h-2 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-1000 transition-opacity duration-500"></div>
    </div>
  );
}
