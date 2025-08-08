import { LogOut } from "lucide-react";
import { useAuth } from "../../../context/auth/AuthContext";
import { useStateContextDashboard } from "../../../context/UtilitiesContext";

const HeadingDashboard = ({ title, batchNo, showLogout }) => {
  const { activeMenu } = useStateContextDashboard();
  const { logout } = useAuth();

  return (
    <div
      className={`${
        activeMenu ? "max-w-6xl mx-auto px-4" : "w-full px-3"
      } flex items-center justify-between mt-6 mb-8`}
    >
      <div className="w-full">
        <h2 className="text-3xl md:text-4xl leading-tight pt-6 pb-4 text-gray-800 md:text-center font-bold">
          {title}
        </h2>
        {batchNo && (
          <div className="text-center">
            <span className="text-gray-600 text-lg">
              Batch Number:{" "}
              <strong className="text-blue-600 font-semibold bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                {batchNo}
              </strong>
            </span>
          </div>
        )}
      </div>

      {showLogout && (
        <button
          type="button"
          onClick={logout}
          className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300
          rounded-lg px-6 py-3 flex justify-center items-center gap-2 text-base font-semibold 
          transition-all duration-200 hover:shadow-md"
        >
          Logout
          <LogOut className="text-lg" />
        </button>
      )}
    </div>
  );
};

export default HeadingDashboard;
