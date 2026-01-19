import React from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

const NothingToShow = () => {
  const handleSupport = async () => {
    const message = prompt("Tell us what you were looking for:");
    if (message) {
      try {
        await api.post("/system/support", {
          subject: "Missing Data Report",
          message,
        });
        alert("Thanks for the feedback!");
      } catch (error) {
        console.error("Failed to submit feedback:", error);
        alert("Failed to submit feedback. Please try again later.");
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center px-6 py-10 text-center">
      {/* Illustration */}
      <img
        src="/nothing.png"
        alt="nothing-to-show"
        className="w-72 h-auto mb-6"
      />

      {/* Try Again Tag */}
      <div 
        className="flex items-center gap-2 px-4 py-2 border border-blue-400 rounded-xl text-blue-700 font-medium text-sm cursor-pointer hover:bg-blue-50"
        onClick={() => window.location.reload()}
      >
        <img src="/blue-clock.png" alt="clock" className="w-4 h-4" />
        Try again later!
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-semibold text-gray-900 mt-6">
        Nothing to Show Yet
      </h1>

      {/* Description */}
      <p className="text-gray-600 text-lg mt-3 leading-relaxed">
        Looks like there's no data available here right now. Let's explore other
        options
      </p>

      {/* Back to Dashboard Button */}
      <Link
        to="/dashboard"
        className="mt-10 w-full max-w-md bg-[#1E5BFF] text-white flex items-center justify-center gap-3 py-4 rounded-xl text-lg font-medium shadow-md active:scale-[0.98] transition hover:bg-blue-600"
      >
        <img src="/home.png" alt="home" className="w-5 h-5" />
        Back to dashboard
      </Link>

      {/* Contact Support */}
      <button
        onClick={handleSupport}
        className="mt-6 flex items-center gap-2 text-blue-700 text-lg hover:underline"
      >
        <img src="/comment-icon.png" alt="support" className="w-5 h-5" />
        Contact Support
      </button>
    </div>
  );
};

export default NothingToShow;

