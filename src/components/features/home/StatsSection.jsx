"use client";

export default function StatsSection() {
  const stats = [
    {
      number: "10,000+",
      label: "Active Users",
      description: "Teams trust DMS-360 daily",
      icon: "👥",
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      number: "99.9%",
      label: "Uptime",
      description: "Reliable service guarantee",
      icon: "⚡",
      gradient: "from-sky-400 to-blue-500",
    },
    {
      number: "50M+",
      label: "Documents",
      description: "Securely managed",
      icon: "📄",
      gradient: "from-violet-400 to-purple-500",
    },
    {
      number: "24/7",
      label: "Support",
      description: "Always here to help",
      icon: "🛟",
      gradient: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"></div>

      {/* Floating elements */}
      <div className="absolute top-10 left-1/4 w-48 h-48 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden text-center"
            >
              {/* Animated background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>

                {/* Number */}
                <div className="mb-2">
                  <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                    {stat.number}
                  </span>
                </div>

                {/* Label */}
                <h3 className="text-xl font-bold text-white mb-2">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-white/70 text-sm">{stat.description}</p>
              </div>

              {/* Floating particles */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-1000 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
