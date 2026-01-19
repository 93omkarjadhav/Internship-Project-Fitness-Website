import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

const Maintenance = () => {
  const [timeLeft, setTimeLeft] = useState("Checking...");

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const response = await api.get("/system/status");
        const data = response as any;
        
        if (data.type === "MAINTENANCE" && data.come_back_time) {
          const end = new Date(data.come_back_time).getTime();
          const now = new Date().getTime();
          const diff = end - now;

          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${hours}h ${mins}m`);
          } else {
            setTimeLeft("Soon");
          }
        } else {
          // Fallback static time if backend isn't sending maintenance data
          setTimeLeft("Soon");
        }
      } catch (error) {
        console.error("Failed to fetch maintenance status:", error);
        setTimeLeft("Soon");
      }
    };

    fetchMaintenanceStatus();
  }, []);

  const handleSupport = async () => {
    const message = prompt("Please describe your query:");
    if (message) {
      try {
        await api.post("/system/support", {
          subject: "Maintenance Query",
          message,
        });
        alert("Ticket submitted.");
      } catch (error) {
        console.error("Failed to submit support ticket:", error);
        alert("Failed to submit ticket. Please try again later.");
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center px-6 py-10 text-center">
      {/* Illustration */}
      <img
        src="/maintenance.png"
        alt="maintenance-img"
        className="w-64 mb-6"
      />

      {/* Status Badge */}
      <div className="bg-red-50 text-red-500 font-medium px-4 py-2 rounded-full text-sm mb-4 flex items-center gap-2">
        <img src="/clock.png" alt="clock" className="w-4 h-4" />
        Come back in {timeLeft}
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Maintenance</h1>

      {/* Description */}
      <p className="text-gray-500 text-base leading-relaxed max-w-xs mb-8">
        Unfortunately, we encountered an issue with our server. Please try again
        or later.
      </p>

      {/* Back to Dashboard Button */}
      <Link
        to="/dashboard"
        className="w-full max-w-md bg-[#2563EB] hover:bg-blue-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 shadow-md transition"
      >
        <img src="/home.png" alt="home-icon" className="w-5 h-5" />
        Back to dashboard
      </Link>

      {/* Contact Support */}
      <button
        onClick={handleSupport}
        className="mt-6 flex items-center gap-2 text-[#2563EB] font-medium text-base hover:underline"
      >
        <img src="/comment-icon.png" alt="support-icon" className="w-5 h-5" />
        Contact Support
      </button>
    </div>
  );
};

export default Maintenance;

