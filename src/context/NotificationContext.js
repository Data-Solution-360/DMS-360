"use client";

import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

// Dummy notification data
const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    title: "New Document Uploaded",
    message:
      'A new document "Project Requirements.pdf" has been uploaded to your folder.',
    type: "document_upload",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    leadId: null,
    paymentData: null,
  },
  {
    id: 2,
    title: "Payment Received",
    message: "Payment of $500 received for Web Development Course.",
    type: "payment_success",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    leadId: null,
    paymentData: {
      batchId: "batch-001",
      amount: 500,
      studentId: "STD001",
    },
  },
  {
    id: 3,
    title: "New Lead Generated",
    message: "A new lead has been generated from the website contact form.",
    type: "lead_generated",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    leadId: "lead_001",
    paymentData: null,
  },
  {
    id: 4,
    title: "System Update",
    message:
      "System maintenance completed successfully. All services are now operational.",
    type: "system_update",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    leadId: null,
    paymentData: null,
  },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
