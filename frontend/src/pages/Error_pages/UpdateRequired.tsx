import React, { useEffect, useState } from "react";
import api from "@/lib/api";

const UpdateRequired = () => {
  const [version, setVersion] = useState("v1.2.9"); // Default fallback

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Check system status to get the latest version
        const response = await api.get("/system/status", {
          params: { version: "0.0.0" },
        });
        const data = response as any;
        
        if (data.type === "UPDATE_REQUIRED" && data.latest_version) {
          setVersion(`v${data.latest_version}`);
        }
      } catch (error) {
        console.error("Failed to check version:", error);
        // Using default version fallback
      }
    };

    checkVersion();
  }, []);

  const handleUpdate = () => {
    // In real app, this goes to App Store / Play Store
    alert(`Redirecting to store to download ${version}...`);
    window.open("https://play.google.com/store/apps", "_blank");
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center px-6 py-10 text-center">
      {/* Illustration */}
      <img src="/update.png" alt="update-required" className="w-70 mb-8" />

      {/* Top small badge */}
      <div className="flex items-center justify-center gap-2 px-2 py-1.5 border border-[#365fcf] rounded-xl text-blue-600 font-medium text-base mb-5">
        <img src="/update-icon.png" alt="subscribe-icon" className="w-4 h-4" />
        {version} is live
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Update Required</h1>

      {/* Description */}
      <p className="text-gray-500 text-base leading-relaxed max-w-xs mb-8">
        A new version of the app is available. Please update to continue using
        the app.
      </p>

      {/* Update App Button */}
      <button
        onClick={handleUpdate}
        className="w-full max-w-md bg-[#1E5BFF] text-white flex items-center justify-center gap-3 py-4 rounded-2xl text-md font-medium shadow-md active:scale-[0.98] transition hover:bg-blue-600"
      >
        <img src="/dwarr-icon.png" alt="download-icon" className="w-5 h-5" />
        Update App
      </button>
    </div>
  );
};

export default UpdateRequired;

