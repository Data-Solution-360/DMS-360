"use client";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CTO at TechFlow Inc",
      company: "TechFlow Inc",
      avatar: "👩‍💼",
      rating: 5,
      text: "DMS-360 has revolutionized how we handle documents. The AI search is incredible - I can find any document in seconds!",
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      name: "Michael Chen",
      role: "Operations Manager",
      company: "Global Solutions",
      avatar: "👨‍💻",
      rating: 5,
      text: "The team collaboration features are game-changing. We've reduced document review time by 70% since switching to DMS-360.",
      gradient: "from-sky-400 to-blue-500",
    },
    {
      name: "Emily Rodriguez",
      role: "Legal Director",
      company: "LawCorp Partners",
      avatar: "👩‍⚖️",
      rating: 5,
      text: "Security and compliance were our top priorities. DMS-360 exceeded our expectations with enterprise-grade encryption and audit trails.",
      gradient: "from-violet-400 to-purple-500",
    },
    {
      name: "David Kim",
      role: "Project Manager",
      company: "InnovateCo",
      avatar: "👨‍🔬",
      rating: 5,
      text: "The Cloud integration is seamless. We can work with our existing files while enjoying DMS-360's advanced features.",
      gradient: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"></div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="mb-6">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full text-amber-300 font-semibold border border-amber-500/30 backdrop-blur-sm">
              ⭐ Customer Success Stories
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              10,000+ Teams
            </span>
          </h2>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            See what our customers say about how DMS-360 has transformed their
            document management workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden"
            >
              {/* Animated background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              <div className="relative z-10">
                {/* Avatar and Rating */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-white/90 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>

                {/* Author Info */}
                <div>
                  <h4 className="text-white font-bold text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-white/70 text-sm">{testimonial.role}</p>
                  <p className="text-emerald-300 text-sm font-semibold">
                    {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
