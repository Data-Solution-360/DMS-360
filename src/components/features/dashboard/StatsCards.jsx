"use client";

import { useEffect, useState } from "react";

// Temporary icon replacements
const FiFile = () => <span>📄</span>;
const FiFolder = () => <span>📁</span>;
const FiUsers = () => <span>👥</span>;
const FiTrendingUp = () => <span>📈</span>;

export default function StatsCards({ stats = {} }) {
  const [animatedStats, setAnimatedStats] = useState({
    totalDocuments: 0,
    totalFolders: 0,
    totalUsers: 0,
    storageUsed: 0,
  });

  useEffect(() => {
    const animateStats = () => {
      const targetStats = {
        totalDocuments: stats.totalDocuments || 0,
        totalFolders: stats.totalFolders || 0,
        totalUsers: stats.totalUsers || 0,
        storageUsed: stats.storageUsed || 0,
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
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const cards = [
    {
      title: "Total Documents",
      value: animatedStats.totalDocuments.toLocaleString(),
      icon: FiFile,
      gradientFrom: "emerald",
      gradientTo: "teal",
      description: "Documents managed",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Total Folders",
      value: animatedStats.totalFolders.toLocaleString(),
      icon: FiFolder,
      gradientFrom: "sky",
      gradientTo: "blue",
      description: "Organized folders",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Active Users",
      value: animatedStats.totalUsers.toLocaleString(),
      icon: FiUsers,
      gradientFrom: "violet",
      gradientTo: "purple",
      description: "Team members",
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Storage Used",
      value: formatStorage(animatedStats.storageUsed),
      icon: FiTrendingUp,
      gradientFrom: "amber",
      gradientTo: "orange",
      description: "Space utilized",
      change: "+5%",
      changeType: "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="group relative bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Animated background gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-${card.gradientFrom}-500/10 via-${card.gradientTo}-500/10 to-${card.gradientFrom}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          ></div>

          {/* Glowing border effect */}
          <div
            className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-${card.gradientFrom}-500 via-${card.gradientTo}-500 to-${card.gradientFrom}-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}
          ></div>

          <div className="relative z-10">
            {/* Icon */}
            <div
              className={`w-12 h-12 bg-gradient-to-r from-${card.gradientFrom}-500 to-${card.gradientTo}-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl group-hover:shadow-${card.gradientFrom}-500/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3`}
            >
              <card.icon className="text-2xl text-white group-hover:scale-110 transition-transform duration-300" />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white/90 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-500">
                {card.title}
              </h3>
              <p className="text-3xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-300 group-hover:to-teal-300 group-hover:bg-clip-text transition-all duration-500">
                {card.value}
              </p>
              <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
                {card.description}
              </p>

              {/* Change indicator */}
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    card.changeType === "positive"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : card.changeType === "negative"
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {card.change}
                </span>
                <span className="text-xs text-white/60">from last month</span>
              </div>
            </div>
          </div>

          {/* Floating particles */}
          <div
            className={`absolute top-4 right-4 w-2 h-2 bg-${card.gradientFrom}-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500`}
          ></div>
          <div
            className={`absolute bottom-4 left-4 w-2 h-2 bg-${card.gradientTo}-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-1000 transition-opacity duration-500`}
          ></div>
        </div>
      ))}
    </div>
  );
}
