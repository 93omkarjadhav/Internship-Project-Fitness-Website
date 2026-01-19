import React, { useEffect, useState } from "react";
import { IoArrowForward } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import { cycleAPI } from "@/lib/api";
import { getUserProfile } from "@/teamd/api/api";

interface LocationState {
  lastPeriodDate?: string;
  symptoms?: string[];
}

const NextPeriod: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [predictedDays, setPredictedDays] = useState(0);
  const [predictedDate, setPredictedDate] = useState("");
  const [periodDates, setPeriodDates] = useState<number[]>([]);
  const [calendarStartDate, setCalendarStartDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string>("User");

  useEffect(() => {
    fetchNextPeriodData();
  }, [state]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await getUserProfile();
        if (!active) return;
        // Use full_name, or extract username from email, or use email, or fallback to "User"
        const name = data?.full_name || 
          (data?.email ? data.email.split('@')[0] : null) || 
          data?.email || 
          "User";
        setDisplayName(name);
      } catch (e) {
        // keep default fallback
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const fetchNextPeriodData = async () => {
    try {
      setLoading(true);
      // Fetch dashboard data which has next period calculation
      const dashboardRes = await cycleAPI.getDashboard();
      
      if (dashboardRes?.data) {
        const data = dashboardRes.data;
        const days = data.next_period_days ?? 0;
        setPredictedDays(days);

        if (data.next_period_date) {
          const nextPeriodDate = new Date(data.next_period_date);
          const formattedDate = nextPeriodDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          setPredictedDate(formattedDate);

          // Calculate period dates (assuming 5 day period length)
          const periodLength = data.avg_period_length || 5;
          const periodDays: number[] = [];
          for (let i = 0; i < periodLength; i++) {
            const d = new Date(nextPeriodDate);
            d.setDate(nextPeriodDate.getDate() + i);
            periodDays.push(d.getDate());
          }
          setPeriodDates(periodDays);

          const startCal = new Date(nextPeriodDate);
          startCal.setDate(nextPeriodDate.getDate() - 2);
          setCalendarStartDate(startCal);
        } else {
          // Fallback to calculation from state if no data
          calculateFromState();
        }
      } else {
        calculateFromState();
      }
    } catch (error) {
      console.error("Error fetching next period data:", error);
      calculateFromState();
    } finally {
      setLoading(false);
    }
  };

  const calculateFromState = () => {
    const lastDate = state?.lastPeriodDate ? new Date(state.lastPeriodDate) : new Date();
    const today = new Date();
    // Use average cycle length of 28 days as fallback
    const cycleLength = 28;

    const predicted = new Date(lastDate);
    predicted.setDate(predicted.getDate() + cycleLength);

    const diff = Math.ceil((predicted.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    setPredictedDays(Math.max(0, diff));

    const formattedDate = predicted.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    setPredictedDate(formattedDate);

    const periodDays: number[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(predicted);
      d.setDate(predicted.getDate() + i);
      periodDays.push(d.getDate());
    }
    setPeriodDates(periodDays);

    const startCal = new Date(predicted);
    startCal.setDate(predicted.getDate() - 2);
    setCalendarStartDate(startCal);
  };

  const handleDashboard = () => {
    navigate("/period/dashboard", {
      state: {
        from: "/period/next-period",
        lastPeriodDate: state?.lastPeriodDate,
        symptoms: state?.symptoms,
      },
    });
  };

  const getMiniCalendarDays = () => {
    const days: { day: string; date: number }[] = [];
    const start = new Date(calendarStartDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({ day: d.toLocaleDateString("en-US", { weekday: "short" })[0], date: d.getDate() });
    }
    return days;
  };

  const miniDays = getMiniCalendarDays();

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4 relative">
      <style>{`.nextperiod-heading{font-weight:400 !important;}`}</style>
      {/* Desktop View */}
      <div className="hidden sm:flex bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 flex-col items-center relative">
        <button
          onClick={() => navigate("/period/analyzing")}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Go back"
        >
          <img src="/week2-assets/chevron left.png" alt="Back" className="w-5 h-5" />
        </button>
        <div className="absolute top-4 justify-center">
          <img src="/week2-assets/l1.png" alt="Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
        </div>

        <h2 className="text-[18px] sm:text-[22px] font-medium text-gray-800 mt-16 mb-4 w-full leading-snug nextperiod-heading">
          Okay, {displayName}.
        </h2>

        <div className="w-full bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <img src="/week2-assets/Vector (10).png" alt="Next period" className="w-5 h-5" />
            <span className="text-gray-800 text-[20px] font-semibold">Your next period </span>
          </div>

          <h3 className="text-[22px] font-bold text-gray-900 mb-1">{predictedDays} days</h3>
          <p className="text-gray-500 text-[14px] mb-2 leading-snug">
            Based on your health data, we predict your next period will occur on{" "}
            <span className="font-regular text-gray-700">{predictedDate}</span>.
          </p>

          <div className="flex items-center gap-2 mb-2">
            <img src="/week2-assets/magic sparkle.png" alt="Confidence" className="w-4 h-4" />
            <span className="text-[13px] text-purple-500 font-semibold">98% Confidence Level</span>
          </div>

          <hr className="border-t border-gray-300 w-full mb-3" />

          <div className="flex justify-between mt-2 gap-3">
            {miniDays.map((d, idx) => {
              const isPeriod = periodDates.includes(d.date);
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="relative w-9 h-16 flex flex-col items-center justify-center rounded-full bg-white border border-white-300 shadow-sm">
                    <span className="text-[11px] text-gray-500 mb-1">{d.day}</span>
                    <span className={`font-regular ${isPeriod ? "text-gray-800" : "text-gray-800"} sm:mb-1`}>
                      {d.date}
                    </span>
                    {isPeriod && <div className="absolute bottom-[2px] sm:bottom-0 w-2 h-2  bg-[#F43F5E] rounded-full mb-1"></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleDashboard}
          className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-blue-600 text-white font-medium py-2.5 px-6 rounded-2xl shadow-md transition duration-300 mt-8"
        >
          See Dashboard <IoArrowForward className="text-white text-lg" />
        </button>
      </div>

      {/* Mobile View */}
      <div className="flex sm:hidden flex-col items-start w-full text-left px-3">
        <div className="flex items-center gap-2 w-full -mt-10 mb-3">
          <button
            onClick={() => navigate("/period/analyzing")}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Go back"
          >
            <img src="/week2-assets/chevron left.png" alt="Back" className="w-5 h-5" />
          </button>
          <img
            src="/week2-assets/l1.png"
            alt="Logo"
            className="w-14 h-14 object-contain"
          />
        </div>

        <h2
          className="text-[24px] font-medium text-gray-700 mb-7 mt-4 leading-snug nextperiod-heading ml-[-5px]"
        >
          Okay, {displayName}.
        </h2>

        <div className="w-full bg-white rounded-2xl shadow-md p-3  mt-2">
          <div className="flex items-center gap-2 mb-3 ">
            <img src="/week2-assets/Vector (10).png" alt="Next period" className="w-5 h-5" />
            <span className="text-gray-800 text-[20px] font-semibold">Your next period</span>
          </div>

          <h3 className="text-[20px] font-bold text-gray-900 mb-3">{predictedDays} days</h3>

          <p className="text-gray-600 text-18px mb-3 leading-snug">
            Based on your health data, we predict your next period will occur on{" "}
            <span className="font-regular text-gray-800">{predictedDate}</span>.
          </p>

          <div className="flex items-center gap-2 mb-5">
            <img src="/week2-assets/magic sparkle.png" alt="Confidence" className="w-5 h-5" />
            <span className="text-[15px] text-purple-500 font-semibold">98% Confidence Level</span>
          </div>

          <hr className="border-t border-gray-300 w-full mb-3" />

          <div className="flex justify-between mt-2 gap-2 w-full">
            {miniDays.map((d, idx) => {
              const isPeriod = periodDates.includes(d.date);
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="relative w-9 h-16 flex flex-col items-center justify-center rounded-full bg-white border border-white-300 shadow-sm">
                    <span className="text-[11px] text-gray-500 mb-0.2">{d.day}</span>
                    <span className={`font-regular ${isPeriod ? "text-gray-800" : "text-gray-800"}`}>
                      {d.date}
                    </span>
                    {isPeriod && <div className="absolute bottom-1 w-2 h-2 bg-[#F43F5E] rounded-full"></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleDashboard}
          className="flex items-center self-end justify-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-3 px-5 rounded-2xl shadow-md transition duration-300 mt-10"
        >
          See Dashboard <IoArrowForward className="text-white text-[20px]" />
        </button>
      </div>
    </div>
  );
};

export default NextPeriod;

