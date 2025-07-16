"use client";

export default function IntegrationSection() {
  const integrations = [
    {
      name: "Cloud",
      description: "Seamless sync with your existing Cloud files",
      icon: "☁️",
      status: "Available",
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      name: "Microsoft Office",
      description: "Edit documents directly in Word, Excel, and PowerPoint",
      icon: "📊",
      status: "Available",
      gradient: "from-sky-400 to-blue-500",
    },
    {
      name: "Slack",
      description: "Share and collaborate on documents in Slack channels",
      icon: "💬",
      status: "Available",
      gradient: "from-violet-400 to-purple-500",
    },
    {
      name: "Zoom",
      description: "Present documents directly in Zoom meetings",
      icon: "🎥",
      status: "Available",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      name: "Salesforce",
      description: "Integrate documents with your CRM workflows",
      icon: "📈",
      status: "Coming Soon",
      gradient: "from-rose-400 to-pink-500",
    },
    {
      name: "API Access",
      description: "Build custom integrations with our REST API",
      icon: "🔌",
      status: "Available",
      gradient: "from-indigo-400 to-purple-500",
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"></div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="mb-6">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full text-violet-300 font-semibold border border-violet-500/30 backdrop-blur-sm">
              🔌 Powerful Integrations
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Works with Your{" "}
            <span className="bg-gradient-to-r from-violet-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Favorite Tools
            </span>
          </h2>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Connect DMS-360 with the tools you already use. No need to change
            your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden"
            >
              {/* Status badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    integration.status === "Available"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {integration.status}
                </span>
              </div>

              {/* Animated background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${integration.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {integration.icon}
                </div>

                {/* Name */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {integration.name}
                </h3>

                {/* Description */}
                <p className="text-white/80 leading-relaxed">
                  {integration.description}
                </p>
              </div>

              {/* Floating particles */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-1000 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-white/60 text-lg mb-8">
            Don't see your favorite tool? We're constantly adding new
            integrations.
          </p>
          <button className="group relative px-12 py-6 rounded-2xl text-xl font-bold text-white overflow-hidden transition-all duration-500 transform hover:scale-110 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 group-hover:from-violet-600 group-hover:via-purple-600 group-hover:to-pink-600 transition-all duration-500"></div>
            <span className="relative flex items-center justify-center">
              Request Integration 🚀
              <div className="ml-2 group-hover:rotate-12 transition-transform duration-300">
                →
              </div>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
