import React, { useState } from "react";
import { IoArrowForward } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const PeriodSelector: React.FC = () => {
  const navigate = useNavigate();

  const defaultDate = new Date(2025, 11, 1);
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const [selectedDate, setSelectedDate] = useState(defaultDate);

  const today = new Date(2025, 11, 1);
  const tomorrow = new Date(2025, 11, 2);

  const handleContinue = async () => {
    try {
      // Format date in local timezone (YYYY-MM-DD) to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const res = await fetch("http://localhost:5000/api/period/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedDate: dateString }),
      });

      if (res.ok) {
        console.log("Date saved successfully");
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to save date:", errorData);
      }
    } catch (error) {
      console.error("Error saving date:", error);
      
    }
    
    // Format date for navigation state (YYYY-MM-DD format)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStringForState = `${year}-${month}-${day}`;
    
    // Always navigate to symptoms page, regardless of API success/failure
    navigate("/period/symptoms", { state: { lastPeriodDate: dateStringForState } });
  };

  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const daysArray: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) daysArray.push(null);
    for (let i = 1; i <= daysInMonth; i++) daysArray.push(new Date(year, month, i));
    return daysArray;
  };

  const days = getCalendarDays(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getSelectedLabel = () => {
    const selectedStr = selectedDate.toDateString();
    if (selectedStr === today.toDateString()) return "Today";
    if (selectedStr === tomorrow.toDateString()) return "Tomorrow";
    return selectedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-white px-4">

      <style>{`.period-heading{font-weight:400 !important;}`}</style>

      <div className="w-full max-w-md flex flex-col justify-between transition-all duration-300 bg-transparent sm:bg-white sm:rounded-2xl sm:shadow-xl sm:p-8 p-0">
        <div className="sm:hidden flex flex-col min-h-screen bg-white px-4 py-4">
          <div className="flex flex-col mt-2">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate("/period/treatment")}
                className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
                aria-label="Go back"
              >
                <img src="/week2-assets/chevron left.png" alt="Back" className="w-5 h-5" />
              </button>
              <img
                src="/week2-assets/l1.png"
                alt="Logo"
                className="w-12 h-12 object-contain flex-shrink-0 ml-2"
              />
            </div>
            <h2 className="text-[20px] sm:text-[26px] font-normal text-black mb-4 sm:mt-0 sm:text-center period-heading break-words">
              When did your last period start?
            </h2>

          </div>
          <hr className="border-gray-300 mb-3" />
          <div className="flex-grow mb-4">
            <div className="flex items-center justify-between mb-3 relative">
              <span className="text-gray-500 text-xs font-medium">{getSelectedLabel()}</span>
              <div className="absolute left-1/2 transform -translate-x-1/2 text-gray-800 text-sm font-semibold">
                {monthName} {year}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={goToPrevMonth}>
                  <img src="/week2-assets/chevron left.png" alt="Previous" className="w-4 h-4" />
                </button>
                <button onClick={goToNextMonth}>
                  <img src="/week2-assets/chevron right.png" alt="Next" className="w-4 h-4" />
                </button>
              </div>
            </div>
            <hr className="border-gray-300 mb-4" />

            <div className="grid grid-cols-7 gap-y-2 text-center text-xs mb-4 w-full">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-gray-500 font-medium text-[10px]">{d}</div>
              ))}
              {days.map((day, idx) =>
                day ? (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`cursor-pointer flex items-center justify-center w-7 h-7 mx-auto rounded-full transition-all text-xs ${
                      selectedDate.toDateString() === day.toDateString()
                        ? "bg-[#2563EB] text-white font-semibold"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                ) : (
                  <div key={idx}></div>
                )
              )}
            </div>
          </div>

          <div className="flex justify-end mt-auto mb-12">
            <button
              onClick={handleContinue}
              className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white font-medium py-3 px-5 rounded-xl shadow-md transition duration-300 text-sm"
            >
              Continue <IoArrowForward className="text-white text-[18px]" />
            </button>
          </div>
        </div>

        <div className="hidden sm:flex flex-col justify-between relative">
          <button
            onClick={() => navigate("/period/treatment")}
            className="absolute top-2 left-2 p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Go back"
          >
            <img src="/week2-assets/chevron left.png" alt="Back" className="w-5 h-5" />
          </button>
          <div className="w-full flex justify-center mb-4">
            <img src="/week2-assets/l1.png" alt="Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
          </div>

          <h2 className="text-[22px] sm:text-[26px] font-normal text-black text-center mb-4 period-heading">
            When did your last period start?
          </h2>

          <hr className="border-gray-300 mb-2" />

          <div className="flex items-center justify-between mb-2 relative">
            <span className="text-gray-500 text-sm font-medium">{getSelectedLabel()}</span>
            <div className="absolute left-1/2 transform -translate-x-1/2 text-gray-800 text-base sm:text-lg font-medium">
              {monthName} {year}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goToPrevMonth}>
                <img src="/week2-assets/chevron left.png" alt="Previous" className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={goToNextMonth}>
                <img src="/week2-assets/chevron right.png" alt="Next" className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <hr className="border-gray-300 mb-4" />

          <div className="grid grid-cols-7 gap-y-3 text-center text-sm sm:text-base mb-6 w-full">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-gray-500 font-medium">{d}</div>
            ))}
            {days.map((day, idx) =>
              day ? (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`cursor-pointer flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full transition-all ${
                    selectedDate.toDateString() === day.toDateString()
                      ? "bg-blue-500 text-white font-semibold"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  {day.getDate()}
                </div>
              ) : (
                <div key={idx}></div>
              )
            )}
          </div>

          <div className="flex justify-center w-full mt-auto">
            <button
              onClick={handleContinue}
              className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white font-medium py-3 px-20 rounded-xl shadow-md transition duration-300 text-base sm:text-lg"
            >
              Continue <IoArrowForward className="text-white text-[18px] sm:text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodSelector;

