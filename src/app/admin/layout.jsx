"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiLoader, FiMoon, FiShield, FiSun } from "react-icons/fi";

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdminAccess();
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem("admin-dark-mode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("admin-dark-mode", newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const result = await response.json();

      if (result.success && result.user) {
        if (result.user.role === "admin") {
          setUser(result.user);
        } else {
          setError("Access denied. Admin privileges required.");
          setTimeout(() => router.push("/dashboard"), 3000);
        }
      } else {
        setError("Authentication required.");
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (error) {
      console.error("Admin access check error:", error);
      setError("Failed to verify admin access.");
      setTimeout(() => router.push("/dashboard"), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 -z-10">
          {/* Dark animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 animate-gradient-xy"></div>

          {/* Floating orbs with better opacity */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/5 to-emerald-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>

          {/* Sparkles with better visibility */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-sky-400 rounded-full animate-ping animation-delay-1000"></div>
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-violet-400 rounded-full animate-ping animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-amber-400 rounded-full animate-ping animation-delay-3000"></div>
        </div>

        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-2xl border border-white/20">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse blur-xl"></div>
              <FiLoader className="animate-spin h-16 w-16 text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text relative z-10 mx-auto" />
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent mb-2">
              Verifying Admin Access
            </h2>
            <p className="text-white/70 text-lg">
              Please wait while we authenticate your credentials...
            </p>
            <div className="mt-6 w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full animate-pulse"
                style={{ width: "60%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 -z-10">
          {/* Dark animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 animate-gradient-xy"></div>

          {/* Floating orbs with red tint for error */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

          {/* Error sparkles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-orange-400 rounded-full animate-ping animation-delay-1000"></div>
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping animation-delay-2000"></div>
        </div>

        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-2xl border border-red-500/20">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-orange-500 opacity-20 animate-pulse blur-xl"></div>
              <FiShield className="h-20 w-20 text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text relative z-10 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent mb-3">
              Access Denied
            </h2>
            <p className="text-white/80 mb-4 text-xl">{error}</p>
            <p className="text-sm text-white/60">
              Redirecting you to the appropriate page...
            </p>
            <div className="mt-6 w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-400 to-orange-400 h-2 rounded-full animate-pulse"
                style={{ width: "80%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Dark animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 animate-gradient-xy"></div>

        {/* Floating orbs with better opacity */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/5 to-emerald-500/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>

        {/* Sparkles with better visibility */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-sky-400 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-violet-400 rounded-full animate-ping animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-amber-400 rounded-full animate-ping animation-delay-3000"></div>
      </div>

      <header className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-sm"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                  <FiShield className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent ml-3">
                Admin Control Center
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 group backdrop-blur-sm border border-white/20"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FiSun className="h-5 w-5 text-yellow-400 group-hover:rotate-180 transition-transform duration-300" />
                ) : (
                  <FiMoon className="h-5 w-5 text-white/70 group-hover:rotate-12 transition-transform duration-300" />
                )}
              </button>
              <div className="flex items-center space-x-3 bg-gradient-to-r from-white/10 to-white/5 rounded-full px-4 py-2 border border-white/20 backdrop-blur-sm">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {user?.name}
                  </span>
                  <span className="text-xs text-white/60">Administrator</span>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-pulse"></div>
                ADMIN
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="relative z-10">{children}</main>
    </div>
  );
}
