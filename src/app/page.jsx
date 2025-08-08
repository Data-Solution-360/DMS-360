"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CTASection,
  FeaturesSection,
  Footer,
  HeroSection,
  IntegrationSection,
  LoadingSpinner,
  Navigation,
  PricingSection,
  StatsSection,
  TestimonialsSection,
} from "../components/features/home";
import { useAuth } from "../store/AuthContext"; // Updated import path

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [mounted, isAuthenticated, router]);

  const handleGetStarted = () => {
    router.push("/register");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  // Show loading while checking auth
  if (!mounted || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation onLogin={handleLogin} onGetStarted={handleGetStarted} />
      <HeroSection onGetStarted={handleGetStarted} onLogin={handleLogin} />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <IntegrationSection />
      <CTASection onGetStarted={handleGetStarted} onLogin={handleLogin} />
      <Footer />
    </div>
  );
}
