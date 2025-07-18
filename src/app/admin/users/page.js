"use client";

import { useState } from "react";
import { FiShield, FiTag, FiUsers } from "react-icons/fi";
import {
  DepartmentManager,
  TagManager,
  UserManagement,
} from "../../../components/features/admin";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    {
      id: "users",
      label: "User Management",
      icon: FiUsers,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "departments",
      label: "Department Management",
      icon: FiShield,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "tags",
      label: "Tag Management",
      icon: FiTag,
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            <span className="block mb-2 text-emerald-300">Admin</span>
            <span className="block bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 bg-clip-text text-transparent animate-pulse">
              Control Panel
            </span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Manage your system with{" "}
            <span className="text-emerald-300 font-semibold">
              comprehensive control
            </span>{" "}
            over{" "}
            <span className="text-sky-300 font-semibold">
              users, departments, and tags
            </span>
            .
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-2">
            <nav className="flex space-x-2" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 py-4 px-6 rounded-2xl font-medium text-sm transition-all duration-300 flex-1 justify-center group relative overflow-hidden ${
                      isActive
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl transform scale-105`
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {/* Background glow for active tab */}
                    {isActive && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${tab.color} opacity-20 blur-xl animate-pulse`}
                      ></div>
                    )}

                    <Icon
                      className={`h-5 w-5 relative z-10 ${
                        isActive ? "text-white" : "group-hover:scale-110"
                      } transition-transform duration-200`}
                    />
                    <span className="font-semibold relative z-10">
                      {tab.label}
                    </span>
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full animate-ping relative z-10"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 left-4 w-48 h-48 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10">
            {activeTab === "users" && (
              <div>
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-2">
                    User Management
                  </h2>
                  <p className="text-white/80 text-lg">
                    Manage user accounts, roles, and permissions across the
                    system
                  </p>
                </div>
                <UserManagement />
              </div>
            )}

            {activeTab === "departments" && (
              <div>
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
                    Department Management
                  </h2>
                  <p className="text-white/80 text-lg">
                    Create and manage departments for organizing tags and users
                  </p>
                </div>
                <DepartmentManager />
              </div>
            )}

            {activeTab === "tags" && (
              <div>
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/20 backdrop-blur-sm">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent mb-2">
                    Tag Management
                  </h2>
                  <p className="text-white/80 text-lg">
                    Create and manage tags that can be used to categorize
                    documents
                  </p>
                </div>
                <TagManager />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
