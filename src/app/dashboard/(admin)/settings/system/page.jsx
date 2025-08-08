"use client";

import { DepartmentManager, TagManager } from "@/components/features";
import { useState } from "react";
import { FiShield, FiTag } from "react-icons/fi";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    {
      id: "departments",
      label: "Department Management",
      icon: FiShield,
    },
    {
      id: "tags",
      label: "Tag Management",
      icon: FiTag,
    },
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Control Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, departments, and tags
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                    isActive
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            {activeTab === "departments" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Department Management
                </h2>
                <DepartmentManager />
              </div>
            )}

            {activeTab === "tags" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Tag Management
                </h2>
                <TagManager />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
