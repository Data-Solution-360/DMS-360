"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../store";

// Define which routes require authentication
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/profile", "/settings"];

// Define which routes authenticated users shouldn't access
const AUTH_ROUTES = ["/login", "/register"];

export default function RouteGuard({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
      );
      const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname.startsWith(route)
      );

      if (isProtectedRoute && (!isAuthenticated || !user)) {
        // Redirect to login if trying to access protected route without auth
        router.push("/login");
      } else if (isAuthRoute && isAuthenticated && user) {
        // Redirect to dashboard if trying to access auth routes while logged in
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  // Show loading for protected routes while checking auth
  if (
    isLoading &&
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}
