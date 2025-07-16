"use client";

export default function CTASection({ onGetStarted, onLogin }) {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-cyan-600 animate-gradient-xy"></div>

      {/* Floating orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-pink-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

      {/* Sparkles */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-cyan-300 rounded-full animate-ping animation-delay-1000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-pink-300 rounded-full animate-ping animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="mb-8">
          <span className="inline-block px-8 py-4 bg-gradient-to-r from-white/20 to-white/10 rounded-full text-white font-bold border border-white/30 backdrop-blur-sm text-lg">
            🎉 Ready to Get Started?
          </span>
        </div>

        <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight">
          Transform Your{" "}
          <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Document Management
          </span>{" "}
          Today!
        </h2>

        <p className="text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
          Join <span className="text-yellow-300 font-bold">10,000+ teams</span>{" "}
          who have already revolutionized their workflow with DMS-360. Start
          your free trial today and experience the{" "}
          <span className="text-cyan-300 font-bold">
            future of document management
          </span>
          .
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
          <button
            onClick={onGetStarted}
            className="group relative px-12 py-6 rounded-2xl text-xl font-bold text-purple-600 overflow-hidden transition-all duration-500 transform hover:scale-110 hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-white group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-orange-300 transition-all duration-500"></div>
            <span className="relative flex items-center justify-center">
              Start Free Trial 🚀
              <div className="ml-2 group-hover:rotate-12 transition-transform duration-300">
                →
              </div>
            </span>
          </button>

          <button
            onClick={onLogin}
            className="group px-12 py-6 rounded-2xl text-xl font-bold text-white border-2 border-white/50 hover:border-white transition-all duration-300 backdrop-blur-sm hover:bg-white/10 transform hover:scale-105"
          >
            Sign In ✨
          </button>
        </div>

        <div className="flex justify-center items-center space-x-8 text-white/70 text-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
            <span>14-Day Free Trial</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
            <span>Cancel Anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
