"use client";

import { ArrowLeft, Shield, UserX } from "lucide-react";
import Link from "next/link";

export default function RegisterForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <UserX className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registration Disabled
            </h1>
            <p className="text-gray-600">
              User self-registration is not allowed in this system.
            </p>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start space-x-3 mb-4">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                How to Get Access
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                To access the system, you need to contact your system
                administrator. They will create your account and provide you
                with login credentials.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              What you need to provide to your admin:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your full name</li>
              <li>• Your email address</li>
              <li>• Your mobile number</li>
              <li>• Your role/department</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
}
