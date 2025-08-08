"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Create the context
const UtilitiesContext = createContext();

// Custom hook to use the context
export const useStateContextDashboard = () => {
  const context = useContext(UtilitiesContext);
  if (!context) {
    throw new Error(
      "useStateContextDashboard must be used within a UtilitiesProvider"
    );
  }
  return context;
};

// Provider component
export const UtilitiesProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState(true);
  const [screenSize, setScreenSize] = useState(0);
  const [enrolledCourse, setEnrolledCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Initialize screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize(width);

      // Auto-hide menu on mobile
      if (width <= 900) {
        setActiveMenu(false);
      } else {
        setActiveMenu(true);
      }
    };

    // Set initial screen size
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load dummy enrolled course data
  useEffect(() => {
    setEnrolledCourse({
      key: "web-development-2024",
      title: "Full Stack Web Development Bootcamp",
      img: "/images/course-placeholder.jpg",
      status: "Active",
      batchId: "batch-001",
      progress: 75,
      instructor: "John Smith",
      startDate: "2024-01-15",
      endDate: "2024-06-15",
    });
  }, []);

  const value = {
    // Menu state
    activeMenu,
    setActiveMenu,

    // Screen size
    screenSize,
    setScreenSize,

    // Course data
    enrolledCourse,
    setEnrolledCourse,

    // Loading state
    isLoading,
    setIsLoading,

    // Notifications
    notifications,
    setNotifications,

    // Utility functions
    toggleMenu: () => setActiveMenu((prev) => !prev),
    showNotification: (notification) => {
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...notification,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    clearNotifications: () => setNotifications([]),
  };

  return (
    <UtilitiesContext.Provider value={value}>
      {children}
    </UtilitiesContext.Provider>
  );
};

export default UtilitiesContext;
