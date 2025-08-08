"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Create the context
const StateContext = createContext();

// Custom hook to use the context
export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
};

// Dummy admin and user data
const DUMMY_USERS = {
  admin: {
    id: "admin_001",
    full_name: "John Anderson",
    userName: "John Anderson",
    email: "admin@company.com",
    role: "admin",
    unique_student_id: "ADM001",
    photoUrl: "/images/admin-avatar.jpg",
    permissions: [
      "create_user",
      "edit_user",
      "delete_user",
      "view_all_documents",
      "manage_departments",
      "manage_tags",
      "system_settings",
    ],
    department: "Administration",
    joinDate: "2023-01-15",
    lastLogin: new Date().toISOString(),
    isActive: true,
    preferences: {
      theme: "dark",
      language: "en",
      notifications: true,
      emailNotifications: true,
    },
  },
  student: {
    id: "std_001",
    full_name: "Sarah Johnson",
    userName: "Sarah Johnson",
    email: "sarah.johnson@student.com",
    role: "student",
    unique_student_id: "STD001",
    photoUrl: "/images/student-avatar.jpg",
    permissions: ["view_documents", "upload_documents", "edit_own_documents"],
    department: "Computer Science",
    batch: "CS-2024-A",
    semester: "6th",
    joinDate: "2023-09-01",
    lastLogin: new Date().toISOString(),
    isActive: true,
    preferences: {
      theme: "light",
      language: "en",
      notifications: true,
      emailNotifications: false,
    },
  },
};

// Provider component
export const StateProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Initialize with dummy admin data
  useEffect(() => {
    // Simulate loading user from localStorage or API
    const savedUserType = localStorage.getItem("userType") || "admin";
    const userData = DUMMY_USERS[savedUserType];

    setCurrentUser(userData);
    setUserName(userData.full_name);
    setUserRole(userData.role);
    setIsAuthenticated(true);

    // Save to sessionStorage for other components
    sessionStorage.setItem("fullName", userData.full_name);
    sessionStorage.setItem("userRole", userData.role);
  }, []);

  // Switch between admin and student for testing
  const switchUserType = (userType = "admin") => {
    const userData = DUMMY_USERS[userType];
    setCurrentUser(userData);
    setUserName(userData.full_name);
    setUserRole(userData.role);

    localStorage.setItem("userType", userType);
    sessionStorage.setItem("fullName", userData.full_name);
    sessionStorage.setItem("userRole", userData.role);
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setUserName("");
    setUserRole("");
    setIsAuthenticated(false);

    localStorage.removeItem("userType");
    sessionStorage.removeItem("fullName");
    sessionStorage.removeItem("userRole");
  };

  const value = {
    // User data
    findCurrentUser: currentUser,
    currentUser,
    userName,
    userRole,
    isAuthenticated,

    // Actions
    setCurrentUser,
    setUserName,
    setUserRole,
    setIsAuthenticated,
    switchUserType,
    logout,

    // Helper functions
    hasPermission: (permission) => {
      return currentUser?.permissions?.includes(permission) || false;
    },

    isAdmin: () => currentUser?.role === "admin",
    isStudent: () => currentUser?.role === "student",

    // Dummy data access
    getAllUsers: () => Object.values(DUMMY_USERS),
    getUserById: (id) =>
      Object.values(DUMMY_USERS).find((user) => user.id === id),
  };

  return (
    <StateContext.Provider value={value}>{children}</StateContext.Provider>
  );
};

export default StateContext;
