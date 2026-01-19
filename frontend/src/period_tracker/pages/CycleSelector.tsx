import React, { useState, useEffect } from "react";
import { IoArrowForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { userAPI } from "@/lib/api";

const CycleSelector: React.FC = () => {
  const [selected, setSelected] = useState(5);
  const navigate = useNavigate();

  // Load previously selected cycle length from mori_dashboard
  useEffect(() => {
    try {
      const dashboardData = JSON.parse(localStorage.getItem("mori_dashboard") || "{}");
      if (dashboardData.cycle_length) setSelected(dashboardData.cycle_length);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Keep mori_dashboard updated whenever selection changes
  useEffect(() => {
    try {
      const dashboardData = JSON.parse(localStorage.getItem("mori_dashboard") || "{}");
      dashboardData.cycle_length = selected;
      localStorage.setItem("mori_dashboard", JSON.stringify(dashboardData));
    } catch (e) {
      console.error(e);
    }
  }, [selected]);

  // On Continue
  const handleContinue = () => {
    try {
      const dashboardData = JSON.parse(localStorage.getItem("mori_dashboard") || "{}");
      dashboardData.cycle_length = selected;
      localStorage.setItem("mori_dashboard", JSON.stringify(dashboardData));

      // Save to backend (non-blocking)
      (async () => {
        try {
          await userAPI.savePreferences({ user_id: 1, period_length: selected });
        } catch (err) {
          console.error("Failed to save preferences", err);
        }
      })();
    } catch (e) {
      console.error(e);
    }

    navigate("/period/treatment");
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-white sm:bg-white">
      <style>{`.cycle-heading{font-weight:400 !important;}`}</style>

      {/* Mobile View */}
      <div className="sm:hidden relative flex flex-col items-center min-h-screen overflow-y-auto overflow-x-hidden px-6 py-6">
        <div className="absolute top-6 left-0 flex items-center gap-3">
          <button
            onClick={() => navigate("/period/setup-intro")}
            className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
            aria-label="Go back"
          >
            <img src="/week2-assets/chevron left.png" alt="Back" className="w-5 h-5" />
          </button>
          <img src="/week2-assets/l1.png" alt="logo" className="w-14 h-14 object-contain ml-1" />
        </div>

        {/* Heading */}
        <div className="mt-24 left-3 text-center">
          <h2 className="text-[22px] font-normal font-['Plus_Jakarta_Sans','sans-serif'] text-[#1E1E1E] leading-snug cycle-heading">
            How long is your typical period length?
          </h2>
          <p className="mt-4 text-[15px] text-gray-600 font-['SF_Pro_Display','SF_Pro_Text',sans-serif]">
            This shows how long your period continues each month. It typically falls between 4 to 7 days.
          </p>
        </div>

        {/* Cycle Options */}
        <div className="mt-20 w-full flex flex-col items-center justify-center h-[30vh] overflow-y-scroll">
          {[...Array(10)].map((_, i) => {
            const day = i + 1;
            const isSelected = day === selected;
            const isAdjacent = Math.abs(day - selected) === 1;

            let colorClass = "text-gray-400 font-normal";
            if (isSelected) colorClass = "text-blue-500 font-semibold";
            else if (isAdjacent) colorClass = "text-black font-normal";

            return (
              <div
                key={day}
                onClick={() => setSelected(day)}
                className={`w-60 h-12 px-10 flex items-center justify-center rounded-lg cursor-pointer text-[24px] mb-4 transition-all duration-200 ${
                  isSelected
                    ? "border-2 border-[#7F9BFF] bg-blue-50"
                    : "border border-transparent hover:border-gray-300"
                } ${colorClass}`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {/* Selected Info */}
        <div className="flex items-center justify-center gap-2 text-gray-500 mt-10 mb-24">
          <img src="/week2-assets/fertile menstruation (1).png" alt="icon" className="w-5 h-5" />
          <p className="font-normal font-['SF_Pro_Display','SF_Pro_Text',sans-serif]">
            My period usually lasts {selected} days
          </p>
        </div>

        {/* Continue Button */}
        <div className="w-full flex justify-end -mt-6 mb-2">
          <button
            onClick={handleContinue}
            className="flex items-center justify-center gap-2 bg-[#3B6AFF] hover:bg-[#3056D8] text-white font-medium py-3 px-5 rounded-2xl shadow-md transition duration-300 text-[15px]"
          >
            Continue <IoArrowForward className="text-[18px]" />
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg md:max-w-md p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center relative">
          <button
            onClick={() => navigate("/period/setup-intro")}
            className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Go back"
          >
            <img src="/week2-assets/chevron left.png" alt="Back" className="w-5 h-5" />
          </button>
          <div className="w-full flex justify-center mb-6">
            <img src="/week2-assets/l1.png" alt="Logo" className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
          </div>

          {/* Heading */}
          <div className="mt-5 left-3 text-center">
            <h2 className="text-[22px] font-normal font-['Plus_Jakarta_Sans','sans-serif'] text-[#1E1E1E] leading-snug cycle-heading">
              How long is your typical period length?
            </h2>
            <p className="mt-2 text-[14px] sm:text-[15px] text-gray-600 font-['SF_Pro_Display','SF_Pro_Text',sans-serif]">
              This shows how long your period continues each month. It typically falls between 4 to 7 days.
            </p>
          </div>

          {/* Cycle Options */}
          <div className="h-48 sm:h-56 overflow-y-scroll flex flex-col items-center space-y-4 px-3 w-full max-w-xs mt-9">
            {[...Array(10)].map((_, i) => {
              const day = i + 1;
              const isSelected = day === selected;
              const isAdjacent = Math.abs(day - selected) === 1;

              let colorClass = "text-gray-400 font-normal";
              if (isSelected) colorClass = "text-blue-500 font-semibold";
              else if (isAdjacent) colorClass = "text-black font-normal";

              return (
                <div
                  key={day}
                  onClick={() => setSelected(day)}
                  className={`w-40 sm:w-48 h-12 sm:h-14 flex items-center justify-center rounded-lg cursor-pointer text-lg sm:text-xl transition-all duration-200 ${
                    isSelected
                      ? "border-2 border-blue-400 bg-blue-50"
                      : "border border-transparent hover:border-gray-300"
                  } ${colorClass}`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Selected Info */}
          <div className="flex items-center mt-8 space-x-2 text-gray-600">
            <img src="/week2-assets/fertile menstruation (1).png" alt="cycle icon" className="w-4 h-4 sm:w-5 sm:h-5" />
            <p className="text-sm sm:text-base font-normal font-['SF_Pro_Display','SF_Pro_Text',sans-serif]">
              My period usually lasts {selected} days
            </p>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="mt-10 flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white font-medium py-2 px-8 rounded-2xl shadow-md transition duration-300 text-base sm:text-lg"
          >
            Continue <IoArrowForward className="text-white text-[18px] sm:text-[20px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CycleSelector;
