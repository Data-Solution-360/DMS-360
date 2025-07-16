import { TagManager } from "../../../components/features";

export default function TagsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tag Management</h1>
          <p className="mt-2 text-gray-600">
            Create and manage tags that can be used to categorize documents and
            improve search functionality.
          </p>
        </div>

        <TagManager />
      </div>
    </div>
  );
}
