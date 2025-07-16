"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// Temporary icon replacements
const FiFolder = () => <span>📁</span>;
const FiHome = () => <span>🏠</span>;
const FiLogOut = () => <span>🚪</span>;
const FiMenu = () => <span>☰</span>;
const FiSearch = () => <span>🔍</span>;
const FiSettings = () => <span>⚙️</span>;
const FiShield = () => <span>🛡️</span>;
const FiSparkles = () => <span>✨</span>;
const FiUser = () => <span>👤</span>;
const FiX = () => <span>✕</span>;

export default function Navbar({
  user,
  searchQuery,
  onSearch,
  searchScope,
  onSearchScopeChange,
  onLogout,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const router = useRouter();

  // Remove the console.log that causes rendering on every user change
  // console.log(user);

  // Memoize computed values
  const isAdmin = useMemo(() => user?.role === "admin", [user?.role]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Memoize callback functions to prevent recreation on every render
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const toggleUserDropdown = useCallback(() => {
    setShowUserDropdown((prev) => !prev);
  }, []);

  const handleLogout = useCallback(() => {
    setIsMobileMenuOpen(false);
    setShowUserDropdown(false);
    onLogout();
  }, [onLogout]);

  const handleNavigation = useCallback(
    (path) => {
      router.push(path);
      setIsMobileMenuOpen(false);
      setShowUserDropdown(false);
    },
    [router]
  );

  const handleSearchChange = useCallback(
    (e) => {
      onSearch(e.target.value);
    },
    [onSearch]
  );

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-gray-900/90 backdrop-blur-xl shadow-2xl border-b border-white/10"
          : "bg-gradient-to-r from-gray-900/95 via-slate-800/90 to-gray-900/95 backdrop-blur-xl shadow-xl border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <div
              className="flex items-center group cursor-pointer animate-scale-in"
              onClick={() => router.push("/")}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full opacity-20 group-hover:opacity-40 transition-all duration-300 blur-sm"></div>
                <FiFolder className="h-8 w-8 text-transparent bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <FiSparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-400 animate-pulse-gentle" />
              </div>
              <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-emerald-300 via-sky-400 to-violet-400 bg-clip-text text-transparent hidden sm:block animate-fade-in">
                DMS-360
              </h1>
            </div>
          </div>

          {/* Desktop Navigation - Center Section */}
          <div className="hidden lg:flex lg:items-center lg:flex-1 lg:justify-center lg:px-8">
            {/* Search Bar */}
            <div className="w-full max-w-md transform transition-all duration-300 hover:scale-105 animate-slide-in-bottom">
              <div className="relative group">
                <div className="relative flex items-center bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:border-emerald-500/30">
                  <div className="pl-4 pr-3">
                    <FiSearch className="h-5 w-5 text-white/60" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search documents..."
                    className="flex-1 py-3 px-3 bg-transparent text-white placeholder-white/60 focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Right Section */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4 flex-shrink-0">
            {/* Admin Actions */}
            {isAdmin && (
              <button
                onClick={() => handleNavigation("/admin/users")}
                className="group relative inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105 transform animate-slide-in-bottom"
                title="Admin Panel"
              >
                <FiShield className="h-4 w-4 mr-2 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                <span>Admin Panel</span>
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}

            {/* User Info with Dropdown */}
            <div className="relative animate-slide-in-bottom">
              <button
                onClick={toggleUserDropdown}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 group"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300">
                    <FiUser className="h-4 w-4 text-white" />
                  </div>
                  {user?.hasDocumentAccess && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full border-2 border-gray-900 animate-pulse-gentle"></div>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {user?.name || user?.email}
                  </p>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 py-0.5 rounded-full font-semibold shadow-md capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50 animate-slide-in-top">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-base font-bold text-white mb-1">
                      {user?.name || "User"}
                    </p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full font-semibold capitalize">
                        {user?.role}
                      </span>
                      {user?.hasDocumentAccess && (
                        <span className="text-xs bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-2 py-0.5 rounded-full">
                          Access Granted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleNavigation("/dashboard")}
                      className="flex items-center w-full px-4 py-2 text-sm text-white/80 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-200"
                    >
                      <FiHome className="h-4 w-4 mr-3 text-emerald-400" />
                      Dashboard
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleNavigation("/admin/users")}
                        className="flex items-center w-full px-4 py-2 text-sm text-white/80 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-200"
                      >
                        <FiShield className="h-4 w-4 mr-3 text-emerald-400" />
                        Admin Panel
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigation("/settings")}
                      className="flex items-center w-full px-4 py-2 text-sm text-white/80 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-200"
                    >
                      <FiSettings className="h-4 w-4 mr-3 text-amber-400" />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-white/10 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-200"
                    >
                      <FiLogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-white/60 hover:text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 group"
            >
              {isMobileMenuOpen ? (
                <FiX className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              ) : (
                <FiMenu className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4 animate-slide-in-top">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="w-full">
                <div className="relative group">
                  <div className="relative flex items-center bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
                    <div className="pl-4 pr-3">
                      <FiSearch className="h-5 w-5 text-white/60" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search documents..."
                      className="flex-1 py-3 px-3 bg-transparent text-white placeholder-white/60 focus:outline-none text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className="flex items-center w-full px-3 py-3 text-sm font-semibold text-white/80 rounded-xl hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-300 group"
                >
                  <FiHome className="h-4 w-4 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                  Dashboard
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleNavigation("/admin/users")}
                    className="flex items-center w-full px-3 py-3 text-sm font-semibold text-white/80 rounded-xl hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 transition-all duration-300 group"
                  >
                    <FiShield className="h-4 w-4 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                    Admin Panel
                  </button>
                )}

                <button
                  onClick={() => handleNavigation("/settings")}
                  className="flex items-center w-full px-3 py-3 text-sm font-semibold text-white/80 rounded-xl hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-300 group"
                >
                  <FiSettings className="h-4 w-4 mr-3 text-amber-400 group-hover:scale-110 transition-transform" />
                  Settings
                </button>
              </div>

              {/* User Info */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center space-x-3 px-3 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                      <FiUser className="h-5 w-5 text-white" />
                    </div>
                    {user?.hasDocumentAccess && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full border-2 border-gray-900 animate-pulse-gentle"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">
                      {user?.name || "User"}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 py-0.5 rounded-full font-semibold shadow-md capitalize">
                        {user?.role}
                      </span>
                      {user?.hasDocumentAccess && (
                        <span className="text-xs bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-2 py-0.5 rounded-full">
                          Access Granted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-white/60 hover:text-red-400 p-2 rounded-xl hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-300"
                  >
                    <FiLogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}
