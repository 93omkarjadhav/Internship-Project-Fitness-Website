import React from "react";
import { Link } from "react-router-dom";

/**
 * Demo page to showcase all error pages
 * This is for development/testing purposes only
 * Access at: /error-pages-demo
 */
const ErrorPagesDemo = () => {
  const errorPages = [
    {
      path: "/error/not-found",
      name: "Not Found (404)",
      description: "Page does not exist",
      color: "bg-red-100 border-red-300 text-red-800",
    },
    {
      path: "/error/server-error",
      name: "Server Error (500)",
      description: "Internal server error",
      color: "bg-red-100 border-red-300 text-red-800",
    },
    {
      path: "/error/not-allowed",
      name: "Not Allowed (403)",
      description: "Permission denied",
      color: "bg-orange-100 border-orange-300 text-orange-800",
    },
    {
      path: "/error/no-internet",
      name: "No Internet",
      description: "Network connectivity issues",
      color: "bg-yellow-100 border-yellow-300 text-yellow-800",
    },
    {
      path: "/error/maintenance",
      name: "Maintenance",
      description: "System under maintenance",
      color: "bg-blue-100 border-blue-300 text-blue-800",
    },
    {
      path: "/error/update-required",
      name: "Update Required",
      description: "App version outdated",
      color: "bg-purple-100 border-purple-300 text-purple-800",
    },
    {
      path: "/error/feature-locked",
      name: "Feature Locked",
      description: "Premium feature access",
      color: "bg-indigo-100 border-indigo-300 text-indigo-800",
    },
    {
      path: "/error/nothing-to-show",
      name: "Nothing to Show",
      description: "Empty state / no data",
      color: "bg-gray-100 border-gray-300 text-gray-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Error Pages Showcase
          </h1>
          <p className="text-gray-600 text-lg">
            Click on any card below to view the corresponding error page
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              ← Back to Dashboard
            </Link>
            <a
              href="/ERROR_PAGES_INTEGRATION.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              📖 View Documentation
            </a>
          </div>
        </div>

        {/* Error Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {errorPages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className="group"
            >
              <div
                className={`${page.color} border-2 rounded-xl p-6 h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold">{page.name}</h3>
                  <span className="text-2xl">→</span>
                </div>
                <p className="text-sm opacity-80">{page.description}</p>
                <div className="mt-4 text-xs font-mono opacity-60">
                  {page.path}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Usage Examples
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                1. Import Error Pages
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import {
  FeatureLocked,
  Maintenance,
  NoInternet,
  NotAllowed,
  NotFoundPage,
  NothingToShow,
  ServerError,
  UpdateRequired,
} from "@/pages/Error_pages";`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                2. Navigate to Error Pages
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Example: API error handling
try {
  const response = await api.get("/endpoint");
} catch (error) {
  if (error.response?.status === 500) {
    navigate("/error/server-error");
  } else if (error.response?.status === 403) {
    navigate("/error/not-allowed");
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                3. Feature Gating
              </h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Check if user has premium access
if (!user.isPremium) {
  navigate("/error/feature-locked");
  return;
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold">Support Ticket Submission</h4>
                <p className="text-sm text-gray-600">
                  Users can submit support tickets directly from error pages
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <h4 className="font-semibold">Dynamic Status Updates</h4>
                <p className="text-sm text-gray-600">
                  Real-time maintenance countdown and version checking
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h4 className="font-semibold">Consistent Design</h4>
                <p className="text-sm text-gray-600">
                  Matches Team-A design language with Tailwind CSS
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <h4 className="font-semibold">Responsive Layout</h4>
                <p className="text-sm text-gray-600">
                  Mobile-first design that works on all screen sizes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPagesDemo;

