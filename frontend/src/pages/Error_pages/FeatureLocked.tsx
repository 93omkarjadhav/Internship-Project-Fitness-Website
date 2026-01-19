import React from "react";

const FeatureLocked = () => {
  const handleSubscribe = () => {
    // In a real app, redirect to Stripe/Payment Gateway
    alert("Redirecting to subscription page...");
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center px-6 py-10 text-center">
      {/* Illustration */}
      <img src="/feature.png" alt="feature-locked" className="w-70 mb-8" />

      {/* Top small subscribe button */}
      <button 
        onClick={handleSubscribe}
        className="flex items-center justify-center gap-2 px-2 py-1.5 border border-[#365fcf] rounded-xl text-blue-600 font-medium text-base mb-5 hover:bg-blue-50 transition"
      >
        <img src="/sub-icon.png" alt="subscribe-icon" className="w-4 h-4" />
        Subscribe to plus
      </button>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Feature Locked</h1>

      {/* Description */}
      <p className="text-gray-500 text-base leading-relaxed max-w-xs mb-8">
        Unfortunately, this feature is only for Plus members. Please subscribe to access.
      </p>

      {/* Primary Subscribe Button */}
      <button
        onClick={handleSubscribe}
        className="w-full max-w-sm bg-[#2563EB] hover:bg-blue-600 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-3 shadow-md transition"
      >
        Subscribe to plus
        <img src="/arr-white.png" alt="arrow-icon" className="w-4 h-4" />
      </button>
    </div>
  );
};

export default FeatureLocked;

