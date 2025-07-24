"use client";

import { useEffect, useRef } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = "",
}) => {
  const modalRef = useRef(null);

  const sizes = {
    sm: "max-w-sm w-full mx-4",
    md: "max-w-md w-full mx-4",
    lg: "max-w-lg w-full mx-4 sm:max-w-2xl",
    xl: "max-w-xl w-full mx-4 sm:max-w-4xl",
    full: "max-w-full mx-4 sm:mx-6 lg:mx-8",
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Mobile-first flex layout */}
      <div className="flex items-start sm:items-center justify-center min-h-screen p-4 text-center">
        {/* Backdrop */}
        <div
          ref={modalRef}
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={closeOnBackdrop ? onClose : undefined}
        />

        {/* Modal */}
        <div className={`relative w-full ${sizes[size]} ${className}`}>
          <div className="inline-block w-full text-left align-bottom sm:align-middle transition-all transform bg-white rounded-lg shadow-xl">
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                {title && (
                  <h3 className="text-lg font-medium text-gray-900 truncate pr-2">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-4 sm:px-6 py-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
