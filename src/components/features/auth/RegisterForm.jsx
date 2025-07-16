"use client";

import Link from "next/link";
import { useState } from "react";
import { validateRegister } from "../../../lib/validations";
import { useAuth } from "../../../store";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();

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
    const validation = validateRegister(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(formData);
      if (!result.success) {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: "Registration failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 animate-gradient-xy"></div>

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/15 to-orange-500/15 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>

        {/* Sparkles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-sky-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-violet-400 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-amber-400 rounded-full animate-ping animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping animation-delay-3000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-500 rounded-xl blur-lg opacity-50"></div>
              <h1 className="relative text-4xl font-black bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                DMS-360
              </h1>
            </div>
          </div>

          <div className="mb-6">
            <span className="inline-block px-6 py-3 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-full text-sky-300 font-semibold border border-sky-500/30 backdrop-blur-sm">
              🚀 Join the Future
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Create your{" "}
            <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Account
            </span>
          </h2>

          <p className="text-white/70 text-lg">
            Or{" "}
            <Link
              href="/login"
              className="font-semibold text-sky-300 hover:text-sky-200 transition-colors duration-300"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        {/* Register Form */}
        <div className="group relative bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-blue-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

          <form className="relative z-10 space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl backdrop-blur-sm">
                <div className="flex items-center">
                  <span className="text-red-400 mr-2">⚠️</span>
                  {errors.general}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-4 bg-white/10 border-2 rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-500/30 ${
                    errors.name
                      ? "border-red-500/50 focus:border-red-400"
                      : "border-white/20 focus:border-sky-400"
                  }`}
                />
                {errors.name && (
                  <p className="mt-2 text-red-300 text-sm flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.name}
                  </p>
                )}
              </div>

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
                  className={`w-full px-4 py-4 bg-white/10 border-2 rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-500/30 ${
                    errors.email
                      ? "border-red-500/50 focus:border-red-400"
                      : "border-white/20 focus:border-sky-400"
                  }`}
                />
                {errors.email && (
                  <p className="mt-2 text-red-300 text-sm flex items-center">
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
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-4 bg-white/10 border-2 rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-500/30 ${
                    errors.password
                      ? "border-red-500/50 focus:border-red-400"
                      : "border-white/20 focus:border-sky-400"
                  }`}
                />
                {errors.password && (
                  <p className="mt-2 text-red-300 text-sm flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  className={`w-full px-4 py-4 bg-white/10 border-2 rounded-xl text-white placeholder-white/50 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-500/30 ${
                    errors.confirmPassword
                      ? "border-red-500/50 focus:border-red-400"
                      : "border-white/20 focus:border-sky-400"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-red-300 text-sm flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-sky-500 focus:ring-sky-500 border-white/30 rounded bg-white/10"
              />
              <label
                htmlFor="agree-terms"
                className="ml-2 block text-sm text-white/80"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-sky-300 hover:text-sky-200 transition-colors duration-300"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-sky-300 hover:text-sky-200 transition-colors duration-300"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full py-4 px-6 rounded-2xl text-lg font-bold text-white overflow-hidden transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 group-hover:from-sky-600 group-hover:via-blue-600 group-hover:to-violet-600 transition-all duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative flex items-center justify-center">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account ✨
                    <div className="ml-2 group-hover:rotate-12 transition-transform duration-300">
                      →
                    </div>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Floating particles */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-sky-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
          <div className="absolute bottom-4 left-4 w-2 h-2 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping animation-delay-1000 transition-opacity duration-500"></div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-sky-300 hover:text-sky-200 transition-colors duration-300"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
