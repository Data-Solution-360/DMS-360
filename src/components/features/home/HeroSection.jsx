"use client";

export default function HeroSection({ onGetStarted, onLogin }) {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center">
          <div className="mb-8">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full text-emerald-300 font-semibold border border-emerald-500/30 backdrop-blur-sm">
              🚀 Next Generation Document Management
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="block mb-4 text-green-300">Manage Your</span>
            <span className="block bg-gradient-to-r from-emerald-300 via-sky-400 to-violet-400 bg-clip-text text-transparent animate-pulse">
              Documents
            </span>
            <span className="block text-4xl md:text-5xl mt-4 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent">
              Like Never Before ✨
            </span>
          </h1>

          <p className="text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
            DMS-360 is a{" "}
            <span className="text-emerald-300 font-semibold">
              revolutionary
            </span>{" "}
            document management system that helps you organize, secure, and
            collaborate on your documents with
            <span className="text-sky-300 font-semibold">
              {" "}
              Cloud integration
            </span>{" "}
            and{" "}
            <span className="text-violet-300 font-semibold">
              advanced AI search
            </span>{" "}
            capabilities.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button
              onClick={onGetStarted}
              className="group relative px-12 py-6 rounded-2xl text-xl font-bold text-white overflow-hidden transition-all duration-500 transform hover:scale-110 hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 group-hover:from-emerald-600 group-hover:via-sky-600 group-hover:to-violet-600 transition-all duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative flex items-center justify-center">
                Start Free Trial 🎉
                <div className="ml-2 group-hover:rotate-12 transition-transform duration-300">
                  →
                </div>
              </span>
            </button>

            <button
              onClick={onLogin}
              className="group px-12 py-6 rounded-2xl text-xl font-bold text-white border-2 border-white/30 hover:border-white/60 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 transform hover:scale-105"
            >
              Sign In ✨
            </button>
          </div>

          <div className="flex justify-center items-center space-x-8 text-white/70">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>10,000+ Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-sky-400 rounded-full animate-pulse"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Dark animated gradient background for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 animate-gradient-xy"></div>

        {/* Floating orbs with better opacity */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/15 to-emerald-500/15 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>

        {/* Sparkles with better visibility */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-sky-400 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-violet-400 rounded-full animate-ping animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-amber-400 rounded-full animate-ping animation-delay-3000"></div>
      </div>
    </section>
  );
}
