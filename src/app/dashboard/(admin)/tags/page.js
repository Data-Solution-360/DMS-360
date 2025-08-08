"use client";

import { TagManager } from "@/components/features";

export default function TagsPage() {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            <span className="block mb-2 text-emerald-300">Tag</span>
            <span className="block bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 bg-clip-text text-transparent animate-pulse">
              Management
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Create and manage tags with{" "}
            <span className="text-emerald-300 font-semibold">
              advanced organization
            </span>{" "}
            and{" "}
            <span className="text-sky-300 font-semibold">
              powerful categorization
            </span>{" "}
            for seamless document management.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 left-4 w-48 h-48 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-violet-500/5 to-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
          </div>

          <div className="relative z-10">
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 backdrop-blur-sm">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent mb-2">
                Tag Management System
              </h2>
              <p className="text-white/80 text-lg">
                Create and manage tags that can be used to categorize documents
                and improve search functionality.
              </p>
            </div>

            <TagManager />
          </div>
        </div>
      </div>
    </div>
  );
}
