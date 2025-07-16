"use client";

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$9",
      period: "per month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 team members",
        "10GB storage",
        "Basic search & filters",
        "Google Drive integration",
        "Email support",
        "Basic analytics",
      ],
      gradient: "from-emerald-400 to-teal-500",
      popular: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "per month",
      description: "Ideal for growing businesses",
      features: [
        "Up to 25 team members",
        "100GB storage",
        "Advanced AI search",
        "Version control",
        "Advanced permissions",
        "Priority support",
        "Advanced analytics",
        "API access",
      ],
      gradient: "from-sky-400 to-blue-500",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited team members",
        "Unlimited storage",
        "Custom AI models",
        "Advanced security",
        "Custom integrations",
        "Dedicated support",
        "Custom analytics",
        "SLA guarantee",
        "On-premise option",
      ],
      gradient: "from-violet-400 to-purple-500",
      popular: false,
    },
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"></div>

      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="mb-6">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-full text-sky-300 font-semibold border border-sky-500/30 backdrop-blur-sm">
              💰 Simple, Transparent Pricing
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className="text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`group relative ${
                plan.popular ? "scale-105" : ""
              } bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border border-white/20 backdrop-blur-xl overflow-hidden`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Most Popular
                  </span>
                </div>
              )}

              {/* Animated background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              <div className="relative z-10">
                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-4xl font-black text-white">
                      {plan.price}
                    </span>
                    <span className="text-white/70 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-white/70">{plan.description}</p>
                </div>

                {/* Features list */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-white/90"
                    >
                      <span className="text-emerald-400 mr-3">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <button
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 ${
                    plan.popular
                      ? "bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 shadow-lg hover:shadow-sky-500/25"
                      : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
                  }`}
                >
                  {plan.popular ? "Start Free Trial" : "Get Started"}
                </button>
              </div>

              {/* Floating particles */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-center mt-16">
          <p className="text-white/60 text-lg mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex justify-center items-center space-x-8 text-white/70">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-sky-400 rounded-full animate-pulse"></div>
              <span>24/7 support</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
              <span>99.9% uptime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
