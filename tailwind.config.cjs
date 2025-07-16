/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./New folder/app/**/*.{js,jsx,ts,tsx}",
    "./New folder/components/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        // Vibrant color palette
        vibrant: {
          blue: "#3B82F6",
          purple: "#8B5CF6",
          pink: "#EC4899",
          emerald: "#10B981",
          teal: "#14B8A6",
          amber: "#F59E0B",
          orange: "#F97316",
          red: "#EF4444",
          indigo: "#6366F1",
          cyan: "#06B6D4",
        },
        // Gradient colors
        gradient: {
          blue: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          purple: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          emerald: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          sunset: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
          ocean: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fire: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
        },
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-gentle": "bounceGentle 2s infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-gentle": "pulseGentle 2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        "slide-in-top": "slideInTop 0.5s ease-out",
        "slide-in-bottom": "slideInBottom 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "rotate-slow": "rotate 20s linear infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        heartbeat: "heartbeat 1.5s ease-in-out infinite",
        "gradient-x": "gradient-x 15s ease infinite",
        "gradient-y": "gradient-y 15s ease infinite",
        "gradient-xy": "gradient-xy 15s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseGentle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideInTop: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInBottom: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        heartbeat: {
          "0%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.1)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.1)" },
          "70%": { transform: "scale(1)" },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "gradient-y": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "center top",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "center bottom",
          },
        },
        "gradient-xy": {
          "0%, 100%": {
            "background-size": "400% 400%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-mesh":
          "radial-gradient(circle at 20% 80%, rgba(59,130,246,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(236,72,153,0.1) 0%, transparent 50%)",
        "gradient-hero": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
        "gradient-button": "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
        "gradient-success": "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)",
        "gradient-warning": "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)",
        "gradient-danger": "linear-gradient(135deg, #EF4444 0%, #EC4899 100%)",
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-emerald": "0 0 20px rgba(16, 185, 129, 0.3)",
        "glow-amber": "0 0 20px rgba(245, 158, 11, 0.3)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.3)",
        "glow-pink": "0 0 20px rgba(236, 72, 153, 0.3)",
        "inner-glow": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        medium:
          "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        large:
          "0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.05)",
        "xl-glow": "0 20px 60px -12px rgba(0, 0, 0, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      fontSize: {
        "2xs": "0.625rem",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
      scale: {
        102: "1.02",
        103: "1.03",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
