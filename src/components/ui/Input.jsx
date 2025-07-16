"use client";

import { forwardRef, useState } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      type = "text",
      className = "",
      fullWidth = false,
      required = false,
      disabled = false,
      readOnly = false,
      placeholder,
      value,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const baseClasses =
      "block w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0";

    const stateClasses = {
      default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      error: "border-red-300 focus:border-red-500 focus:ring-red-500",
      disabled: "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed",
      readonly: "border-gray-200 bg-gray-50",
    };

    const getStateClass = () => {
      if (disabled) return stateClasses.disabled;
      if (readOnly) return stateClasses.readonly;
      if (error) return stateClasses.error;
      return stateClasses.default;
    };

    const classes = [
      baseClasses,
      getStateClass(),
      leftIcon ? "pl-10" : "",
      rightIcon ? "pr-10" : "",
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleFocus = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e) => {
      if (disabled || readOnly) return;
      onChange?.(e);
    };

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={classes}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{rightIcon}</span>
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div className="mt-1">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {helperText && !error && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
