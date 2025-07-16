"use client";

export default function FeatureCard({
  icon,
  title,
  description,
  gradientFrom,
  gradientTo,
}) {
  return (
    <div className="group relative bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

      <div className="relative z-10">
        <div
          className={`w-16 h-16 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-pink-500/50 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3`}
        >
          <span className="text-3xl text-white group-hover:scale-110 transition-transform duration-300">
            {icon}
          </span>
        </div>
        <h3 className="text-2xl font-black text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all duration-500">
          {title}
        </h3>
        <p className="text-white/80 leading-relaxed group-hover:text-white/95 transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Floating particles */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
      <div className="absolute bottom-4 left-4 w-2 h-2 bg-cyan-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-1000 transition-opacity duration-500"></div>
    </div>
  );
}
