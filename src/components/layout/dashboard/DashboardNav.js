import { Badge, Drawer, Tooltip } from "antd";
import {
  Bell,
  LogOut,
  Menu,
  Settings,
  Shield,
  User,
  UserCircle,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStateContext } from "../../../context/ContextProvider";
import { useNotifications } from "../../../context/NotificationContext";
import { useStateContextDashboard } from "../../../context/UtilitiesContext";
import { userNamePrefix } from "../../../data/data";
import { useAuth } from "../../../store/AuthContext"; // Updated import path

const DashboardNavbar = () => {
  const {
    activeMenu,
    setActiveMenu,
    screenSize,
    setScreenSize,
    enrolledCourse,
  } = useStateContextDashboard();
  const { userName, findCurrentUser } = useStateContext();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [insideCourse, setInsideCourse] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const previousUnreadCount = useRef(0);
  const profileDropdownRef = useRef(null);

  const router = useRouter();

  console.log(user);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize(width);
      if (width > 900) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (unreadCount > previousUnreadCount.current) {
      const audio = new Audio("/mp3/notification-bell.mp3");
      audio.play().catch(() => {});
    }
    previousUnreadCount.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const slug = window.location.href.split("/");
      setInsideCourse(
        enrolledCourse?.key &&
          slug.includes(enrolledCourse.key) &&
          slug.includes("my-course")
      );
    }
  }, [enrolledCourse]);

  useEffect(() => {
    setActiveMenu(screenSize > 900);
  }, [screenSize]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function getInitials(name) {
    let words = name?.split(" ");
    words = words?.filter((word) => !userNamePrefix.includes(word));
    const initials = words?.map((word) => word.charAt(0)).join("");
    return initials?.toUpperCase();
  }

  const handleLogout = async () => {
    try {
      await logout();
      // The logout function handles redirection
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileAction = (action) => {
    setIsProfileDropdownOpen(false);

    switch (action) {
      case "profile":
        router.push("/admin/profile");
        break;
      case "settings":
        router.push("/admin/settings");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  const NotificationPanel = () => (
    <div className="absolute right-0 mt-2 w-80 max-w-[95vw] bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.read ? "bg-blue-50" : ""
              }`}
              onClick={() => {
                markAsRead(notification.id);
                if (notification.leadId) {
                  router.push(`/admin/lead-sells/sells-tracking`);
                } else if (
                  notification.type === "payment_success" &&
                  notification.paymentData
                ) {
                  router.push(
                    `/admin/course/${notification.paymentData.batchId}`
                  );
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <UserCircle className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`
      fixed right-0 bg-white z-50 border-b border-gray-200
      ${activeMenu ? "w-[calc(100%-256px)]" : "w-[calc(100%-72px)]"}
      ${screenSize <= 900 ? "!w-full" : ""}
    `}
    >
      <div className="flex justify-between items-center p-3 md:mx-6 relative">
        {screenSize <= 900 && (
          <button
            onClick={() => setActiveMenu(!activeMenu)}
            className="p-3 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {activeMenu ? <X /> : <Menu />}
          </button>
        )}

        <div className="flex-grow overflow-x-auto">
          {enrolledCourse && insideCourse && (
            <div className="flex items-center gap-3 min-w-max bg-blue-50 rounded-lg p-3 border border-blue-200">
              <Image
                width={500}
                height={300}
                src={enrolledCourse?.img}
                alt="Logo"
                className="h-10 w-20 rounded-lg object-cover"
              />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h4 className="text-sm sm:text-base font-semibold truncate text-gray-800">
                  {enrolledCourse?.title}
                </h4>
                <div className="flex gap-2 items-center flex-wrap">
                  <p className="font-medium text-center text-xs sm:text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
                    Batch-1
                  </p>
                  <p className="text-xs sm:text-sm text-orange-600 font-semibold">
                    {enrolledCourse?.status}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-3 rounded-lg flex items-center justify-center transition-colors border border-gray-200"
            >
              <Badge count={unreadCount}>
                <Bell className="text-xl text-gray-600" />
              </Badge>
            </button>

            {/* Desktop Notification Panel */}
            {screenSize > 640 && isNotificationOpen && <NotificationPanel />}

            {/* Mobile Drawer */}
            {screenSize <= 640 && (
              <Drawer
                title="Notifications"
                placement="right"
                onClose={() => setIsNotificationOpen(false)}
                open={isNotificationOpen}
                width="100%"
                className="bg-white text-gray-800"
              >
                {notifications.length === 0 ? (
                  <div className="text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.leadId) {
                          router.push(`/admin/lead-sells/sells-tracking`);
                          setIsNotificationOpen(false);
                        } else if (
                          notification.type === "payment_success" &&
                          notification.paymentData
                        ) {
                          router.push(
                            `/admin/course/${notification.paymentData.batchId}`
                          );
                          setIsNotificationOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <UserCircle className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </Drawer>
            )}
          </div>

          {/* Profile Section */}
          <div className="relative" ref={profileDropdownRef}>
            <Tooltip title="Profile" color="#6b7280">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="group flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200"
              >
                {/* Profile Photo Container */}
                <div className="relative flex-shrink-0">
                  <div className="border-2 border-blue-400 rounded-full shadow-sm transition-all duration-200">
                    {user?.profilePicture ? (
                      <Image
                        width={500}
                        height={300}
                        className="w-10 h-10 rounded-full object-cover"
                        src={user?.profilePicture}
                        alt={user?.name || userName}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex justify-center items-center font-semibold bg-blue-500 text-white text-sm">
                        {getInitials(user?.name || findCurrentUser?.name)}
                      </div>
                    )}
                  </div>

                  {/* Online Status */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                </div>

                {/* User Info */}
                <div className="hidden sm:block flex-col justify-center min-w-0 flex-1">
                  <div className="text-left font-medium text-gray-800 text-sm truncate">
                    {user?.name || findCurrentUser?.name || userName}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-gray-500">Role:</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                      {user?.role || findCurrentUser?.role}
                    </span>
                  </div>
                </div>
              </button>
            </Tooltip>

            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* User Info Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="border-2 border-blue-400 rounded-full shadow-sm">
                        {user?.profilePicture ? (
                          <Image
                            width={500}
                            height={300}
                            className="w-12 h-12 rounded-full object-cover"
                            src={user?.profilePicture}
                            alt={user?.name || userName}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full flex justify-center items-center font-semibold bg-blue-500 text-white text-base">
                            {getInitials(user?.name || findCurrentUser?.name)}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {user?.name || findCurrentUser?.name || userName}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {user?.email || findCurrentUser?.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-400">Role:</span>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {user?.role || findCurrentUser?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dropdown Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => handleProfileAction("profile")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => handleProfileAction("settings")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => handleProfileAction("permissions")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span>Permissions</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Logout Button */}
                <div className="py-2">
                  <button
                    onClick={() => handleProfileAction("logout")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;
