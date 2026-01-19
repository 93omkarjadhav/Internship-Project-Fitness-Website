// src/pages/Streak.tsx
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import streakImg from "../assets/streakImg.jpg";
import { useNavigate } from "react-router-dom";
import { getStreakData } from "../api/api";

/* ========================= TYPES ========================= */

interface StreakDay {
  day: string;
  status: string;
  key?: string;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  weekly_status?: {
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
  };
}

/* ========================= COMPONENT ========================= */

const Streak: React.FC = () => {
  const navigate = useNavigate();

  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 👉 THIS REF IS WHAT WE SHARE AS IMAGE
  const shareRef = useRef<HTMLDivElement>(null);

  /* ========================= FETCH DATA ========================= */

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const response = await getStreakData();
        setStreakData(response.data);
      } catch (err) {
        console.error("Error fetching streak data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, []);

  /* ========================= HELPERS ========================= */

  const getStreakDays = (): StreakDay[] => {
    if (!streakData || !streakData.weekly_status) {
      return [
        { day: "Mon", status: "pending" },
        { day: "Tue", status: "pending" },
        { day: "Wed", status: "pending" },
        { day: "Thu", status: "pending" },
        { day: "Fri", status: "pending" },
        { day: "Sat", status: "pending" },
        { day: "Sun", status: "pending" },
      ];
    }

    const s = streakData.weekly_status;
    return [
      { day: "Mon", status: s.mon },
      { day: "Tue", status: s.tue },
      { day: "Wed", status: s.wed },
      { day: "Thu", status: s.thu },
      { day: "Fri", status: s.fri },
      { day: "Sat", status: s.sat },
      { day: "Sun", status: s.sun },
    ];
  };

  const getTodayKey = () => {
    const keys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return keys[new Date().getDay()];
  };

  /* ========================= STREAK LOGIC ========================= */

  const orderedDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const todayKey = getTodayKey();
  const todayIndex = orderedDays.indexOf(todayKey);
  const streakLength = streakData?.current_streak ?? 0;

  const streakDays = getStreakDays().map((d) => ({
    ...d,
    key: d.day.toLowerCase().slice(0, 3),
  }));

  const computedDays = streakDays.map((d, i) => {
    let diff = todayIndex - i;
    if (diff < 0) diff += 7;

    const isInStreak = diff < streakLength;
    const isPastDay = i < todayIndex;
    const isMissed = isPastDay && !isInStreak;

    return {
      ...d,
      status: isInStreak ? "done" : isMissed ? "missed" : "pending",
    };
  });

  /* ========================= IMAGE SHARE ========================= */

  const shareStory = async () => {
    if (!shareRef.current) return;

    try {
      const canvas = await html2canvas(shareRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) return;

      const file = new File([blob], "fitfare-streak.png", {
        type: "image/png",
      });

      // 📱 Mobile native share
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My FitFare Streak",
          text: `🔥 I'm on a ${streakData?.current_streak}-day streak on FitFare!`,
          files: [file],
        });
      } else {
        // 💻 Desktop fallback
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "fitfare-streak.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  /* ========================= LOADING ========================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 p-8 text-center text-gray-600 dark:text-gray-300">
        Loading streak...
      </div>
    );
  }

  /* ========================= UI ========================= */

  return (
<div className="min-h-screen bg-white dark:bg-gray-800 px-4 py-8 flex flex-col items-center overflow-x-hidden">
{/* ===== NAVBAR (NOT SHARED) ===== */}
      <div className="w-full flex items-center mb-8">
        <ArrowLeft
          className="text-gray-700 dark:text-white cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          size={22}
          onClick={() => navigate(-1)}
        />
        <p className="text-gray-700 dark:text-white text-lg ml-2 font-medium">Streak</p>
      </div>

      {/* ===== SHARE AREA START ===== */}
      <div ref={shareRef} className="w-full max-w-full flex flex-col items-center overflow-hidden">
      {/* Fire Icon */}
        <div className="flex flex-col items-center mt-4">
          <div className="relative flex items-center justify-center">
          <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-gray-100 animate-pulse"></div>
<div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-gray-100 animate-pulse"></div>
<div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-100 animate-pulse"></div>

            <div
              style={{ backgroundImage: `url('${streakImg}')` }}
              className="flex items-center justify-center w-20 h-20 rounded-full bg-cover bg-center text-white text-3xl font-bold shadow-lg"
            >
              {streakData?.current_streak ?? 0}
            </div>
          </div>

          <p className="text-gray-800 dark:text-white text-lg mt-16 font-medium">
            day streak this week!
          </p>
        </div>

        {/* Days */}
        <div className="flex justify-center gap-3 sm:gap-6 mt-8 w-full max-w-full overflow-hidden">
        {computedDays.map((d, i) => (
            <div key={i} className="flex flex-col items-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{d.day}</p>

              {d.status === "done" ? (
                <div className="relative w-12 h-14">
                  <img src="/yellow-tick.png" className="w-full h-full" />
                  <img
                    src="/white-tick.png"
                    className="absolute w-4 h-4"
                    style={{ bottom: "16px", left: "50%", transform: "translateX(-50%)" }}
                  />
                </div>
              ) : d.status === "missed" ? (
                <span className="text-red-500 text-2xl font-bold">✕</span>
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" />
              )}
            </div>
          ))}
        </div>

        {/* Stats Card */}
        <div className="w-full max-w-md mt-12 bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">Your Streaks</h2>

          <div className="flex justify-around mb-4">
            <div>
              <p className="text-orange-500 dark:text-orange-400 text-3xl font-bold">
                {streakData?.current_streak ?? 0}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Current</p>
            </div>

            <div>
              <p className="text-blue-600 dark:text-blue-400 text-3xl font-bold">
                {streakData?.longest_streak ?? 0}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Longest</p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm">
            You're on a{" "}
            <span className="font-semibold text-orange-500 dark:text-orange-400">
              {streakData?.current_streak}-day
            </span>{" "}
            streak — keep going!
          </p>
        </div>
      </div>
      {/* ===== SHARE AREA END ===== */}

      {/* Share Button */}
      <button
        onClick={shareStory}
        className="mt-6 px-6 py-3 rounded-xl bg-orange-500 dark:bg-orange-600 text-white text-lg font-semibold shadow hover:bg-orange-600 dark:hover:bg-orange-700 transition flex items-center gap-2 active:scale-95"
      >
        <Share2 className="w-5 h-5" />
        Share
      </button>
    </div>
  );
};

export default Streak;
