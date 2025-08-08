"use client";

import { useEffect, useState } from "react";

// Temporary icon replacements
const FiFile = () => <span>📄</span>;
const FiFolder = () => <span>📁</span>;
const FiUsers = () => <span>👥</span>;
const FiHardDrive = () => <span>💾</span>;
const FiDatabase = () => <span>🗄️</span>;
const FiTrendingUp = () => <span>📈</span>;

export default function StatsCards({ stats = {} }) {
  const [animatedStats, setAnimatedStats] = useState({
    totalDocuments: 0,
    totalFolders: 0,
    totalUsers: 0,
    storageUsed: 0,
    totalVersions: 0,
  });
  const [showDetailedView, setShowDetailedView] = useState(false);

  useEffect(() => {
    const animateStats = () => {
      const targetStats = {
        totalDocuments: stats.totalDocuments || 0,
        totalFolders: stats.totalFolders || 0,
        totalUsers: stats.totalUsers || 0,
        storageUsed: stats.storageUsed || 0,
        totalVersions: stats.totalVersions || 0,
      };

      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setAnimatedStats({
          totalDocuments: Math.floor(targetStats.totalDocuments * easeOutQuart),
          totalFolders: Math.floor(targetStats.totalFolders * easeOutQuart),
          totalUsers: Math.floor(targetStats.totalUsers * easeOutQuart),
          storageUsed: Math.floor(targetStats.storageUsed * easeOutQuart),
          totalVersions: Math.floor(targetStats.totalVersions * easeOutQuart),
        });

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    };

    animateStats();
  }, [stats]);

  const formatStorage = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  const cards = [
    {
      title: "Documents",
      value: formatNumber(animatedStats.totalDocuments),
      subtitle: `${formatNumber(animatedStats.totalVersions)} total versions`,
      icon: FiFile,
      gradientFrom: "emerald",
      gradientTo: "teal",
      description: "Active documents",
      change: stats.averageVersionsPerDocument
        ? `${stats.averageVersionsPerDocument.toFixed(1)} avg versions`
        : "+12%",
      changeType: "info",
    },
    {
      title: "Folders",
      value: formatNumber(animatedStats.totalFolders),
      subtitle: stats.storageUtilization?.documentsWithVersions
        ? `${stats.storageUtilization.documentsWithVersions} versioned`
        : "",
      icon: FiFolder,
      gradientFrom: "sky",
      gradientTo: "blue",
      description: "Organized folders",
      changeType: "positive",
    },
    {
      title: "Users",
      value: formatNumber(animatedStats.totalUsers),
      subtitle: stats.activeUsers ? `${stats.activeUsers} active` : "",
      icon: FiUsers,
      gradientFrom: "violet",
      gradientTo: "purple",
      description: "Team members",
      changeType: "positive",
    },
    {
      title: "Storage Used",
      value: formatStorage(stats.averageFileSize),
      icon: FiHardDrive,
      gradientFrom: "amber",
      gradientTo: "orange",
      description: "Total storage (all versions)",

      changeType: stats.orphanedFiles?.count > 0 ? "warning" : "neutral",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={card.title}
            className="group relative bg-gradient-to-br from-white/10 to-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background gradients */}
            <div
              className={`absolute inset-0 bg-gradient-to-br from-${card.gradientFrom}-500/10 via-${card.gradientTo}-500/10 to-${card.gradientFrom}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            ></div>

            <div className="relative z-10">
              {/* Icon and value section */}
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <card.icon className="h-5 w-5 sm:h-6 sm:w-6 text-black/80 mr-2 sm:mr-3" />
                    <h3 className="text-xs sm:text-sm font-medium text-black/80 truncate">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-black text-black">
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-xs text-black/50 mt-1">
                      {card.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Description and change indicator */}
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-black/60">
                  {card.description}
                </p>
              </div>
            </div>

            {/* Responsive floating particle */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
          </div>
        ))}
      </div>

      {/* Detailed Storage Breakdown */}
      {stats.storageByType && (
        <div className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl border border-white/20 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center">
              <FiDatabase className="mr-2" />
              Storage Breakdown
            </h3>
            <button
              onClick={() => setShowDetailedView(!showDetailedView)}
              className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              {showDetailedView ? "Hide Details" : "Show Details"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.storageByType).map(([type, data]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-black">
                  {formatStorage(data.size)}
                </div>
                <div className="text-sm text-black/70 capitalize">
                  {type} ({data.count})
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                    style={{
                      width: `${(data.size / stats.storageUsed) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {showDetailedView && stats.userStorage && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h4 className="text-md font-semibold text-black mb-4">
                Storage by User (Top 5)
              </h4>
              <div className="space-y-2">
                {Object.entries(stats.userStorage)
                  .sort(([, a], [, b]) => b.totalSize - a.totalSize)
                  .slice(0, 5)
                  .map(([userId, userData]) => (
                    <div
                      key={userId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-black/80 truncate">
                        {userData.userName}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-black/60">
                          {userData.documentCount} docs
                        </span>
                        <span className="text-black font-medium">
                          {formatStorage(userData.totalSize)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Orphaned Files Warning */}
          {stats.orphanedFiles?.count > 0 && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div className="flex items-center text-yellow-300">
                <span className="mr-2">⚠️</span>
                <span className="text-sm">
                  {stats.orphanedFiles.count} orphaned files detected (
                  {formatStorage(stats.orphanedFiles.estimatedSize)})
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
