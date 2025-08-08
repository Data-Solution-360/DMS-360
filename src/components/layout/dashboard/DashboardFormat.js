import { useStateContextDashboard } from "../../../context/UtilitiesContext";
import DashboardNavbar from "./DashboardNav";
import Sidebar from "./Sidebar";

const DashboardFormat = ({ children, user, onLogout }) => {
  const { activeMenu } = useStateContextDashboard();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Sidebar */}
      {activeMenu ? (
        <div className="w-64 fixed border-r border-gray-200 bg-white transition-all duration-300 z-50 h-screen shadow-sm">
          <Sidebar />
        </div>
      ) : (
        <div className="w-[72px] fixed border-r border-gray-200 bg-white transition-all duration-300 z-50 h-screen shadow-sm">
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div
        className={`bg-gray-50 min-h-screen ${
          activeMenu ? "md:ml-64" : "ml-[72px]"
        } transition-all duration-300`}
      >
        {/* Navigation */}
        <div className="fixed bg-white w-full shadow-sm border-b border-gray-200 z-40">
          <DashboardNavbar />
        </div>

        {/* Page Content */}
        <div className="pt-[88px] px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6 m-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFormat;
