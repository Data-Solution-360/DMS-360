"use client";

import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { useAuth } from "../../store";

const Header = () => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch full user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile({
              uid: user.uid,
              email: user.email,
              name: userData.name || user.email?.split("@")[0] || "User",
              role: userData.role || "user",
              ...userData,
            });
          } else {
            // Fallback if no document exists
            setUserProfile({
              uid: user.uid,
              email: user.email,
              name: user.email?.split("@")[0] || "User",
              role: "user",
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Fallback on error
          setUserProfile({
            uid: user.uid,
            email: user.email,
            name: user.email?.split("@")[0] || "User",
            role: "user",
          });
        }
      }
      setLoading(false);
    };

    if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  console.log("Current user:", user);
  console.log("User profile:", userProfile);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    setUserProfile(null);
    router.push("/");
  };

  // Get display name and role
  const displayName =
    userProfile?.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User";
  const userRole = userProfile?.role || "user";
  const userInitials =
    displayName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">DMS-360</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="/dashboard"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="/documents"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Documents
            </a>
            <a
              href="/folders"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Folders
            </a>
            <a
              href="/tags"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Tags
            </a>
            {/* Show admin link if user has admin role */}
            {userRole === "admin" && (
              <a
                href="/admin"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin
              </a>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {userInitials}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="text-gray-700 font-medium">{displayName}</div>
                  {userRole && (
                    <div className="text-xs text-gray-500 capitalize">
                      {userRole}
                    </div>
                  )}
                </div>
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-700">
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                    <div className="text-xs text-blue-600 capitalize">
                      {userRole}
                    </div>
                  </div>
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile
                  </a>
                  <a
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Settings
                  </a>
                  {userRole === "admin" && (
                    <a
                      href="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Admin Panel
                    </a>
                  )}
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
