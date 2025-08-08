import { Collapse, ConfigProvider } from "antd";
import { ChevronDown, ChevronRight, MenuIcon, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStateContext } from "../../../context/ContextProvider";
import { useStateContextDashboard } from "../../../context/UtilitiesContext";
import { linksAdmin } from "../../../data/data";

const Sidebar = () => {
  const { activeMenu, setActiveMenu, screenSize } = useStateContextDashboard();
  const { findCurrentUser } = useStateContext();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(isMobileMenuOpen);
    } else {
      setActiveMenu(true);
      setIsMobileMenuOpen(false);
    }
  }, [screenSize, isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Check if a link is active based on current pathname
  const isLinkActive = (link) => {
    if (link === pathname) return true;

    // For nested routes, check if pathname starts with the link
    // This handles cases like /dashboard/users/add when we're on /dashboard/users
    if (link !== "/dashboard" && pathname.startsWith(link)) return true;

    return false;
  };

  const renderSingleItem = (item) => (
    <div
      key={item.title}
      className={`mt-2 ${activeMenu ? "mx-2" : "ml-2 mr-2"}`}
    >
      <Link
        href={item.link}
        onClick={closeMobileMenu}
        className={`flex items-center ${
          activeMenu
            ? "justify-start pl-4 rounded-lg"
            : "justify-center py-3 rounded-lg"
        } ${
          isLinkActive(item.link)
            ? "bg-blue-50 text-blue-600 border border-blue-200"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        } gap-4 p-3 text-sm font-medium mx-1 transition-all duration-200`}
      >
        <span className="text-lg">{item.icon}</span>
        {activeMenu && <span className="capitalize">{item.title}</span>}
      </Link>
    </div>
  );

  const renderCollapsibleItem = (item) => {
    const filteredLinks =
      item.links?.filter((link) =>
        Array.isArray(link.role)
          ? link.role.includes(findCurrentUser?.role)
          : link.role === findCurrentUser?.role
      ) || [];

    if (filteredLinks.length === 0) return null;

    const collapseItems = [
      {
        key: item.id,
        label: (
          <div className="flex items-center gap-3">
            <span className="text-lg">{item.icon}</span>
            {activeMenu && (
              <p className="text-gray-700 font-semibold">{item.title}</p>
            )}
          </div>
        ),
        children: (
          <div className="space-y-1 mt-2">
            {filteredLinks.map((link) => (
              <Link
                href={link.link}
                key={link.name}
                onClick={closeMobileMenu}
                className={`flex items-center ${
                  activeMenu
                    ? "justify-start pl-4 rounded-lg"
                    : "justify-center py-2 rounded-lg"
                } ${
                  isLinkActive(link.link)
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } gap-3 p-2 text-sm font-medium mx-1 transition-all duration-200`}
              >
                <span className="text-base">{link.icon}</span>
                {activeMenu && <span className="capitalize">{link.name}</span>}
              </Link>
            ))}
          </div>
        ),
      },
    ];

    return (
      <div key={item.title} className={`${activeMenu ? "mx-3" : "m-0"} mb-4`}>
        <ConfigProvider
          theme={{
            components: {
              Collapse: {
                headerBg: "transparent",
                contentBg: "transparent",
                colorBorder: "#e5e7eb",
                colorText: "#374151",
              },
            },
          }}
        >
          <Collapse
            collapsible="header"
            expandIconPosition="end"
            expandIcon={({ isActive }) =>
              isActive ? (
                <ChevronDown className="text-lg font-medium text-blue-500" />
              ) : (
                <ChevronRight className="text-lg font-medium text-gray-500" />
              )
            }
            defaultActiveKey={["1"]}
            ghost={true}
            className="bg-gray-50 rounded-lg border border-gray-200"
            items={collapseItems}
          />
        </ConfigProvider>
      </div>
    );
  };

  const renderNavigationItems = () =>
    linksAdmin.map((item) => {
      // Check if user has permission for single items
      if (item.type === "single") {
        const hasPermission = Array.isArray(item.role)
          ? item.role.includes(findCurrentUser?.role)
          : item.role === findCurrentUser?.role;

        return hasPermission ? renderSingleItem(item) : null;
      }

      // Handle collapsible items
      return renderCollapsibleItem(item);
    });

  return (
    <>
      {/* Mobile Menu Toggle */}
      {screenSize <= 900 && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={toggleMobileMenu}
            className="bg-white border border-gray-300 p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            {isMobileMenuOpen ? <X /> : <MenuIcon />}
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 
          w-64 lg:w-auto border-r border-gray-200
          bg-white
          transform transition-transform duration-300
          ${
            screenSize <= 900
              ? isMobileMenuOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }
          flex flex-col h-screen shadow-sm
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 justify-center px-5 mt-4 mb-4 pb-7 pt-[21px] border-b border-gray-200 flex-shrink-0">
          {activeMenu && (
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="group relative items-center justify-center gap-3 flex text-xl font-extrabold tracking-tight transition-all duration-300 hover:scale-105"
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-sm"></div>

              {/* Main logo text with gradient */}
              <span className="relative bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-indigo-600 transition-all duration-300">
                DMS
              </span>

              {/* Animated separator */}
              <div className="relative flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse group-hover:scale-125 transition-transform duration-300"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping opacity-30"></div>
              </div>

              {/* 360 with special styling */}
              <span className="relative">
                <span className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <span className="relative bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-indigo-600 transition-all duration-300 font-black">
                  360
                </span>
              </span>

              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:translate-x-full transition-all duration-700 transform -skew-x-12"></div>
            </Link>
          )}
        </div>

        {/* Navigation Links - Scrollable */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <div className="space-y-1">{renderNavigationItems()}</div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 bg-black/25 z-30 lg:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;
