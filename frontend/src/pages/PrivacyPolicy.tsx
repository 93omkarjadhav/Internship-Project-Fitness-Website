import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, X, Globe, Download } from "lucide-react";
import { preloadImage } from "../utils/imagePreloader";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState("English (EN)");
  
  // Get the return path from location state (default to /signup)
  const returnPath = (location.state as any)?.returnPath || "/signup";

  // Preload logo image immediately when component mounts
  useEffect(() => {
    // Preload logo for Privacy Policy page
    preloadImage("/logo.png");
    
    // Force immediate loading with Image object
    const img = new Image();
    if ('fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }
    img.src = "/logo.png";
    
    // Also preload signup page images in case user goes back
    preloadImage("/image-1.webp");
    preloadImage("/image.png");
    preloadImage("/sign-up.png");
  }, []);

  const handleAccept = () => {
    // Navigate back to the page that linked here (usually signup)
    navigate(returnPath);
  };

  const handleDecline = () => {
    // Navigate back to the page that linked here (usually signup)
    navigate(returnPath);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8 md:py-12">
        <div className="max-w-md w-full md:max-w-2xl mx-auto space-y-6">
          {/* Logo and Version */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Fitfare logo" 
                className="w-12 h-12 object-contain"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="px-3 py-1 bg-white border border-gray-100 rounded-lg">
              <span className="text-s text-gray-500">v2.5.2</span>
            </div>
          </div>

          {/* Title and Date */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-600">Privacy Policy</h1>
            <p className="text-xl text-gray-400">Effective Date: 23 Nov 2026</p>
          </div>

          {/* Language Selector */}
          <div className="relative flex items-center justify-center gap-1.5 px-1.5 h-8 border border-gray-300 rounded-[10px] bg-gray-50 w-1/2 mx-auto">
            <Globe className="w-4 h-4 text-gray-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white border-gray-300 outline-none text-gray-600 text-sm text-center appearance-none pr-5 h-full"
            >
              <option>English (EN)</option>
              <option>Spanish (ES)</option>
              <option>French (FR)</option>
            </select>
            <svg
              className="w-4 h-4 text-gray-400 absolute right-1.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Download PDF Link */}
          <div className="flex items-center justify-center gap-2">
            <Download className="w-4 h-4 text-[#2563EB]" />
            <button className="text-[#2563EB] font-medium text-sm bg-transparent border-none outline-none">
              Download as PDF
            </button>
          </div>

          {/* Introduction */}
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              At FitFare ("we", "our", or "us"), we value your privacy and are committed to
              protecting your personal information. This Privacy Policy outlines how we collect,
              use, and safeguard your data when you use our fitness and wellness application.
            </p>
          {/* Separator line */}
          <hr className="border-t border-gray-200" />

            {/* Section 1: Information We Collect */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-600">1. Information We Collect</h2>
              <p>
                We collect the following types of information to provide and improve our services:
              </p>
              <ul className="space-y-2 pl-4">
                <li className="list-disc">
                  <strong>Personal Information:</strong> When you sign up for FitFare, we collect
                  your name, email address, gender, and other contact information.
                </li>
                <li className="list-disc">
                  <strong>Health & Fitness Data:</strong> To help manage your fitness journey, we collect data
                  such as nutrition logs, workout activities, period tracking information (if applicable), and wellness metrics.
                </li>
                <li className="list-disc">
                  <strong>Usage Data:</strong> We collect information on how you use the app, such
                  as app interactions, device information, IP address, and usage logs.
                </li>
                <li className="list-disc">
                  <strong>Cookies:</strong> We use cookies to track app usage patterns and improve
                  your experience.
                </li>
              </ul>
            </div>
          {/* Separator line */}
          <hr className="border-t border-gray-200" />
          
            {/* Section 2: How We Use Your Information */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-600">2. How We Use Your Information</h2>
              <p>We use your personal information to:</p>
              <ul className="space-y-2 pl-4">
                <li className="list-disc">
                  Provide personalized fitness and nutrition recommendations.
                </li>
                <li className="list-disc">
                  Track your health metrics and provide insights.
                </li>
                <li className="list-disc">
                  Improve, troubleshoot, and enhance app functionality.
                </li>
                <li className="list-disc">
                  Send relevant notifications, updates, and reports on your health and fitness progress.
                </li>
                <li className="list-disc">
                  Comply with legal and regulatory requirements.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-6 space-y-3 border-t border-gray-100 flex justify-center">
  
  <div className="w-full max-w-sm space-y-3">
    <button
      onClick={handleAccept}
      style={{ backgroundColor: '#2563EB' }}
      className="w-full text-white font-medium text-base py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-colors"
    >
      I Accept
      <Check className="w-5 h-5" />
    </button>

    <button
      onClick={handleDecline}
      className="w-full bg-red-500 text-white font-medium text-base py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
    >
      I decline
      <X className="w-5 h-5" />
    </button>
  </div>

</div>

    </div>
  );
};

export default PrivacyPolicy;

