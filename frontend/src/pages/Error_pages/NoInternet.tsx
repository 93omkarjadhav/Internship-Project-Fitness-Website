import React from "react";

const NoInternet = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  // Support here uses mailto because API calls won't work without internet!
  const handleSupport = () => {
    window.location.href = "mailto:support@fitfare.com?subject=No Internet Issue";
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center px-6 py-10 text-center">
      {/* Illustration */}
      <img src="/network.png" alt="no-internet" className="w-70 mb-6" />

      {/* Status Badge */}
      <div className="bg-red-50 text-red-500 font-medium px-4 py-2 rounded-full text-sm mb-4 flex items-center gap-2">
        <img src="/internet-icon.png" alt="wifi-alert" className="w-4 h-4" />
        Please Connect
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">No Internet!</h1>

      {/* Description */}
      <p className="text-gray-500 text-base leading-relaxed max-w-xs mb-8">
        Please ensure that you have an active internet connection!
      </p>

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        className="w-full max-w-md bg-[#2563EB] hover:bg-blue-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 shadow-md transition"
      >
        <img src="/refresh-icon.png" alt="refresh" className="w-5 h-5" />
        Refresh
      </button>

      {/* Contact Support */}
      <button
        onClick={handleSupport}
        className="mt-6 flex items-center gap-2 text-[#2563EB] font-medium text-base hover:underline"
      >
        <img src="/comment-icon.png" alt="chat" className="w-5 h-5" />
        Contact Support
      </button>
    </div>
  );
};

export default NoInternet;

