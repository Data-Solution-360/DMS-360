"use client";

import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: "📁",
    title: "Smart Organization",
    description:
      "Organize documents in hierarchical folders with tags, metadata, and AI-powered automatic categorization.",
    gradientFrom: "emerald-400",
    gradientTo: "teal-500",
  },
  {
    icon: "🔒",
    title: "Secure Access Control",
    description:
      "Granular permissions and role-based access control with enterprise-grade encryption and zero-knowledge architecture.",
    gradientFrom: "rose-500",
    gradientTo: "pink-600",
  },
  {
    icon: "☁️",
    title: "Google Drive Integration",
    description:
      "Seamlessly sync with Google Drive, Dropbox, and other cloud services for unified file management.",
    gradientFrom: "sky-400",
    gradientTo: "blue-600",
  },
  {
    icon: "🔍",
    title: "Advanced Search",
    description:
      "Find documents instantly with AI-powered semantic search, filters, and intelligent content analysis.",
    gradientFrom: "amber-400",
    gradientTo: "orange-500",
  },
  {
    icon: "📊",
    title: "Version Control",
    description:
      "Track document versions, changes, and maintain a complete audit trail with advanced analytics.",
    gradientFrom: "violet-500",
    gradientTo: "purple-600",
  },
  {
    icon: "👥",
    title: "Team Collaboration",
    description:
      "Share documents, assign permissions, and collaborate with your team in real-time with advanced workflows.",
    gradientFrom: "fuchsia-500",
    gradientTo: "pink-500",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Enhanced background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-purple-900/40 to-emerald-900/50"></div>

      {/* Multiple floating elements with better colors */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-emerald-500/30 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-r from-rose-500/30 to-pink-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gradient-to-r from-sky-500/25 to-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-gradient-to-r from-violet-500/25 to-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-3000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="mb-6">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full text-emerald-300 font-semibold border border-emerald-500/30 backdrop-blur-sm">
              ✨ Amazing Features
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              Modern Teams
            </span>
          </h2>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Everything you need to manage your documents efficiently and
            collaborate effectively with your team in one beautiful platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="transform hover:scale-105 transition-all duration-500"
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradientFrom={feature.gradientFrom}
                gradientTo={feature.gradientTo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
