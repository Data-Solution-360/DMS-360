"use client";

export default function Navigation({ onLogin, onGetStarted }) {
  return (
    <nav className="bg-gradient-to-r from-purple-900/90 via-blue-900/90 to-pink-900/90 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl blur-lg opacity-75"></div>
              <h1 className="relative text-3xl font-black bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                DMS-360
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button
              onClick={onLogin}
              className="text-white/90 hover:text-white px-6 py-3 rounded-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 transition-all duration-300 shadow-2xl hover:shadow-pink-500/25 transform hover:scale-110 hover:-translate-y-1"
            >
              Get Started ✨
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
