"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { validateLogin } from "../../../lib/validations";
import { useAuth } from "../../../store/AuthContext"; // Updated import path

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        // Enhanced error handling with error codes
        setErrors({
          general: result.error,
          code: result.code,
          timestamp: result.timestamp,
        });

        // Log error details for debugging
        console.error("Login failed:", {
          error: result.error,
          code: result.code,
          timestamp: result.timestamp,
        });
      } else {
        // The AuthContext should handle the redirect automatically
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general:
          "An unexpected error occurred. Please try again or contact support if the issue persists.",
        code: "UNEXPECTED_ERROR",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      {/* Background Elements - Responsive sizing */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 animate-gradient-xy"></div>

        {/* Responsive floating orbs */}
        <div className="absolute top-10 left-5 w-48 h-48 sm:top-20 sm:left-10 sm:w-96 sm:h-96 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-10 right-5 w-48 h-48 sm:bottom-20 sm:right-10 sm:w-96 sm:h-96 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-sm w-full space-y-6 sm:max-w-md sm:space-y-8 relative z-10">
        {/* Header - Responsive text sizing */}
        <div className="text-center">
          <div className="mb-4 sm:mb-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-lg opacity-50"></div>
              <Link href="/">
                <h1 className="relative text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                  DMS-360
                </h1>
              </Link>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <span className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full text-emerald-300 font-semibold border border-emerald-500/30 backdrop-blur-sm text-sm sm:text-base">
              🔐 Welcome Back
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-3 sm:mb-4">
            Sign in to your{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              Account
            </span>
          </h2>

          <p className="text-white/70 text-sm sm:text-base lg:text-lg">
            Or{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-300 hover:text-emerald-200 transition-colors duration-300"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Login Form - Responsive form container */}
        <div className="group relative bg-gradient-to-br from-white/10 to-white/5 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <form
            className="relative z-10 space-y-4 sm:space-y-6"
            onSubmit={handleSubmit}
          >
            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-2 sm:px-4 sm:py-3 rounded-xl backdrop-blur-sm text-sm">
                <div className="flex items-start">
                  <span className="text-red-400 mr-2 mt-0.5">⚠️</span>
                  <div className="flex-1">
                    <div className="font-medium">{errors.general}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className={`w-full px-3 py-3 sm:px-4 sm:py-4 bg-white/10 border-2 rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 text-sm sm:text-base ${
                    errors.email
                      ? "border-red-500/50 focus:border-red-400"
                      : "border-white/20 focus:border-emerald-400"
                  }`}
                />
                {errors.email && (
                  <p className="mt-2 text-red-300 text-xs sm:text-sm flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className={`w-full px-3 py-3 sm:px-4 sm:py-4 bg-white/10 border-2 rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 text-sm sm:text-base ${
                    errors.password
                      ? "border-red-500/50 focus:border-red-400"
                      : "border-white/20 focus:border-emerald-400"
                  }`}
                />
                {errors.password && (
                  <p className="mt-2 text-red-300 text-xs sm:text-sm flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Responsive flex layout for form extras */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-white/30 rounded bg-white/10"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-white/80"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-emerald-300 hover:text-emerald-200 transition-colors duration-300"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold text-white overflow-hidden transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 group-hover:from-emerald-600 group-hover:via-sky-600 group-hover:to-violet-600 transition-all duration-500"></div>
              <span className="relative flex items-center justify-center">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In ✨
                    <div className="ml-2 group-hover:rotate-12 transition-transform duration-300">
                      →
                    </div>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-white/60 text-xs sm:text-sm">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="text-emerald-300 hover:text-emerald-200 transition-colors duration-300"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-emerald-300 hover:text-emerald-200 transition-colors duration-300"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
