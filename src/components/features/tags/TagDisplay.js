"use client";

// Temporary icon replacements
const FiX = ({ size = 16 }) => <span style={{ fontSize: size }}>✕</span>;

export default function TagDisplay({ tags = [], onRemoveTag }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <div
          key={tag._id || index}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300"
        >
          <span className="capitalize">{tag.name}</span>
          {onRemoveTag && (
            <button
              onClick={() => onRemoveTag(tag)}
              className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
            >
              <FiX size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
