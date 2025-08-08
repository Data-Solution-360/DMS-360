const ButtonDashboard = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled,
  variant = "primary", // primary, secondary, ghost, danger
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400";
      case "ghost":
        return "bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-800";
      case "danger":
        return "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300";
      default: // primary
        return "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600";
    }
  };

  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`
        px-5 py-3 rounded-lg border font-semibold
        flex items-center justify-center transition-all duration-200
        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default ButtonDashboard;
