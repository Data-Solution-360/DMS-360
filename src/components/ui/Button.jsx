"use client";

import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      disabled = false,
      loading = false,
      fullWidth = false,
      className = "",
      onClick,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary:
        "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      warning:
        "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
      outline:
        "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    };

    // Responsive sizes
    const sizes = {
      sm: "px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm",
      md: "px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-sm",
      lg: "px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base",
      xl: "px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg",
    };

    const classes = [
      baseClasses,
      variants[variant],
      sizes[size],
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleClick = (e) => {
      if (disabled || loading) return;
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
