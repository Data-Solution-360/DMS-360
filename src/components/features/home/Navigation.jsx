"use client";

import { useState } from "react";

export default function Navigation({ onLogin, onGetStarted }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-purple-900/90 via-blue-900/90 to-pink-900/90 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl blur-lg opacity-75"></div>
              <h1 className="relative text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                DMS-360
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <button
              onClick={onLogin}
              className="text-white/90 hover:text-white px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-6 lg:px-8 py-2 lg:py-3 text-sm lg:text-base rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 transition-all duration-300 shadow-2xl hover:shadow-pink-500/25 transform hover:scale-110 hover:-translate-y-1"
            >
              Get Started ✨
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4 space-y-4">
            <button
              onClick={onLogin}
              className="block w-full text-center text-white/90 hover:text-white px-4 py-3 text-base rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="block w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-6 py-3 text-base rounded-xl font-semibold transition-all duration-300 shadow-xl"
            >
              Get Started ✨
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}
