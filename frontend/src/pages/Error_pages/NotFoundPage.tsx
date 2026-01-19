import React from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

const NotFoundPage = () => {
  const handleSupport = async () => {
    const message = prompt("Please describe the issue you are facing:");
    if (message) {
      try {
        await api.post("/system/support", {
          subject: "404 Not Found",
          message,
        });
        alert("Support ticket submitted successfully.");
      } catch (error) {
        console.error("Failed to submit support ticket:", error);
        alert("Failed to submit ticket. Please try again.");
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center px-6 py-10 text-center">
      {/* Illustration */}
      <img
        src="/notfound.png"
        alt="not-found-illustration"
        className="w-70 mb-6"
      />

      {/* Status Badge */}
      <div className="bg-red-50 text-red-500 px-4 py-2 rounded-full text-sm mb-4 flex items-center gap-2">
        <img src="/triangle.png" alt="alert" className="w-4 h-4" />
        Status Code: 404
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Not Found</h1>

      {/* Description */}
      <p className="text-gray-500 text-base leading-relaxed max-w-xs mb-8">
        Unfortunately, this page is not found. Please try again sometime later or
        refresh.
      </p>

      {/* Back to Dashboard Button */}
      <Link
        to="/dashboard"
        className="w-full max-w-md bg-[#2563EB] hover:bg-blue-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-md transition"
      >
        <img src="/home.png" alt="home-icon" className="w-5 h-5" />
        Back to dashboard
      </Link>

      {/* Contact Support */}
      <button
        onClick={handleSupport}
        className="mt-6 flex items-center gap-2 text-[#2563EB] font-medium text-base hover:underline"
      >
        <img src="/comment-icon.png" alt="chat-icon" className="w-5 h-5" />
        Contact Support
      </button>
    </div>
  );
};

export default NotFoundPage;

