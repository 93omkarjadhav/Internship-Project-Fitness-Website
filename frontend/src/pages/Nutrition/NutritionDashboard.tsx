import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { useUserGender } from "../../hooks/useUserGender";
import {
  fetchNutritionScore,
  fetchNutritionInsight,
  fetchNutritionHistory,
  fetchNutritionSchedule,
  fetchWeeklyNutrition,
  MealData,
  NutritionInsight,
  ScheduledMeal,
  WeeklyPoint,
} from "../lib/api";
import { getUserProfile } from "../../teamd/api/api";
import NutritionSchedule from "./NutritionSchedule";
import OnboardingTour from "../../components/OnboardingTour";
import { Step } from "react-joyride";


// ------------------------ helpers ------------------------
const isBeforeNow = (dateStr: string, timeStr?: string) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;

  if (timeStr) {
    const [h = 0, m = 0, s = 0] = timeStr.split(":").map(Number);
    date.setHours(h || 0, m || 0, s || 0, 0);
  }
  return date.getTime() <= Date.now();
};

const isAfterNow = (dateStr: string, timeStr?: string) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;

  if (timeStr) {
    const [h = 0, m = 0, s = 0] = timeStr.split(":").map(Number);
    date.setHours(h || 0, m || 0, s || 0, 0);
  }
  return date.getTime() > Date.now();
};

type TimeRange = "1d" | "1w" | "1m" | "1y" | "all";
type ChartRow = { day: string; calories: number; protein: number; fat: number };

// format short date like "Jan 23"
const formatShortDate = (iso: string) => {
  try {
    const d = new Date(iso);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return d.toLocaleDateString(undefined, opts);
  } catch {
    return iso;
  }
};

// last N days at local midnight
const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}`;
const monthLabel = (d: Date) =>
  d.toLocaleDateString(undefined, { month: "short" });

const weekStart = (d: Date) => {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 Sun .. 6 Sat
  // make Monday-start week; shift so Mon=0
  const shift = (day + 6) % 7;
  return addDays(x, -shift);
};

const dayLabel = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "short" }); // Mon, Tue, ...

// Build chart rows from meals for each range
const buildChart = (meals: MealData[], range: TimeRange): ChartRow[] => {
  if (!meals || meals.length === 0) return [];

  // Normalize meals to JS Dates and keep macros
  const normalized = meals.map((m) => {
    const d = new Date(m.meal_date);
    // if time exists, set hours to it so 1d works better
    if (m.meal_time) {
      const [h = 0, mi = 0, s = 0] = m.meal_time.split(":").map(Number);
      d.setHours(h || 0, mi || 0, s || 0, 0);
    }
    return {
      date: d,
      calories: Number(m.calories || 0),
      protein: Number(m.protein || 0),
      fat: Number(m.fat || 0),
    };
  });

  const now = new Date();

  if (range === "1d") {
    // 24 hourly buckets for today
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);

    const buckets: Record<
      number,
      { calories: number; protein: number; fat: number }
    > = {};
    for (let h = 0; h < 24; h++) buckets[h] = { calories: 0, protein: 0, fat: 0 };

    normalized.forEach((m) => {
      if (m.date >= today && m.date < tomorrow) {
        const h = m.date.getHours();
        buckets[h].calories += m.calories;
        buckets[h].protein += m.protein;
        buckets[h].fat += m.fat;
      }
    });

    return Array.from({ length: 24 }, (_, h) => ({
      day: `${h.toString().padStart(2, "0")}:00`,
      calories: Math.round(buckets[h].calories),
      protein: Math.round(buckets[h].protein),
      fat: Math.round(buckets[h].fat),
    })).filter((r) => r.calories || r.protein || r.fat); // hide empty hours for a cleaner look
  }

  if (range === "1w") {
    // last 7 days (Mon..Sun style)
    const end = startOfDay(now);
    const start = addDays(end, -6);

    const map: Record<
      string,
      { calories: number; protein: number; fat: number; date: Date }
    > = {};
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, i);
      const key = d.toDateString();
      map[key] = { calories: 0, protein: 0, fat: 0, date: d };
    }

    normalized.forEach((m) => {
      const dKey = startOfDay(m.date).toDateString();
      if (map[dKey]) {
        map[dKey].calories += m.calories;
        map[dKey].protein += m.protein;
        map[dKey].fat += m.fat;
      }
    });

    return Object.values(map).map((row) => ({
      day: dayLabel(row.date),
      calories: Math.round(row.calories),
      protein: Math.round(row.protein),
      fat: Math.round(row.fat),
    }));
  }

  if (range === "1m") {
    // last 4 weeks (Mon-start)
    const end = weekStart(now); // this week start
    const starts = [0, -1, -2, -3].map((w) => addDays(end, w * 7)).reverse();
    const labels = ["W1", "W2", "W3", "W4"];
    const buckets = starts.map((s) => ({
      from: s,
      to: addDays(s, 7),
      calories: 0,
      protein: 0,
      fat: 0,
    }));

    normalized.forEach((m) => {
      buckets.forEach((b) => {
        if (m.date >= b.from && m.date < b.to) {
          b.calories += m.calories;
          b.protein += m.protein;
          b.fat += m.fat;
        }
      });
    });

    return buckets.map((b, i) => ({
      day: labels[i],
      calories: Math.round(b.calories),
      protein: Math.round(b.protein),
      fat: Math.round(b.fat),
    }));
  }

  if (range === "1y") {
    // last 12 months grouped by month
    const months: { key: string; date: Date }[] = [];
    const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let i = 11; i >= 0; i--) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
      months.push({ key: monthKey(d), date: d });
    }

    const map: Record<string, { calories: number; protein: number; fat: number }> =
      {};
    months.forEach((m) => (map[m.key] = { calories: 0, protein: 0, fat: 0 }));

    normalized.forEach((m) => {
      const key = monthKey(m.date);
      if (map[key]) {
        map[key].calories += m.calories;
        map[key].protein += m.protein;
        map[key].fat += m.fat;
      }
    });

    return months.map((m) => ({
      day: monthLabel(m.date),
      calories: Math.round(map[m.key].calories),
      protein: Math.round(map[m.key].protein),
      fat: Math.round(map[m.key].fat),
    }));
  }

  // "all" – group by month across entire history
  const groups: Record<string, { date: Date; calories: number; protein: number; fat: number }> =
    {};
  normalized.forEach((m) => {
    const key = monthKey(m.date);
    if (!groups[key]) {
      groups[key] = { date: new Date(m.date.getFullYear(), m.date.getMonth(), 1), calories: 0, protein: 0, fat: 0 };
    }
    groups[key].calories += m.calories;
    groups[key].protein += m.protein;
    groups[key].fat += m.fat;
  });

  return Object.values(groups)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((g) => ({
      day: `${monthLabel(g.date)}`,
      calories: Math.round(g.calories),
      protein: Math.round(g.protein),
      fat: Math.round(g.fat),
    }));
};
/* ========================= SIDEBAR FROM WELCOME ========================= */

// const [showSchedule, setShowSchedule] = useState(false);
const Sidebar = ({ sidebarOpen }: { sidebarOpen: boolean }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { userGender } = useUserGender();

  return (
    <>
      {/* MOBILE BOTTOM NAV (we keep your existing bottom nav below, so hide this) */}
      <div className="md:hidden hidden"></div>

      {/* DESKTOP SIDEBAR */}
      <div
        className={`
          hidden md:flex md:flex-col md:justify-start
          md:fixed md:top-0 md:left-0 md:h-full
          bg-white border-r shadow-sm
          transition-all duration-300
          ${sidebarOpen ? "md:w-60" : "md:w-20"}
        `}
      >
        <div className="mt-[100px] flex flex-col gap-8 px-3">
          <Link to="/welcome">
            <NavItem icon="/home-gray.png" label="Home" sidebarOpen={sidebarOpen} />
          </Link>
          <Link to="/wellness/ai-chat">
            <NavItem icon="/ai-pic.png" label="AI Assistant" sidebarOpen={sidebarOpen} />
          </Link>
          <Link to="/bookings">
            <NavItem icon="/resources.png" label="My Bookings" sidebarOpen={sidebarOpen} />
          </Link>
          {userGender === 'Female' || userGender === null ? (
            <Link to="/cycles">
              <NavItem icon="/cycle-1.png" label="Periods Cycle" sidebarOpen={sidebarOpen} />
            </Link>
          ) : (
            <button
              onClick={() => navigate("/period-restricted")}
              className="w-full"
            >
              <NavItem icon="/cycle-1.png" label="Periods Cycle" sidebarOpen={sidebarOpen} />
            </button>
          )}
          <Link to="/nutrition/home">
            <NavItem icon="/leaf-1.png" label="Nutrition" sidebarOpen={sidebarOpen} />
          </Link>
          <Link to="/wellness/settings">
            <NavItem icon="/Monotone add (6).png" label="Profile" sidebarOpen={sidebarOpen} />
          </Link>
        </div>
      </div>
    </>
  );
};

const NavItem = ({
  icon,
  label,
  sidebarOpen,
}: {
  icon: string;
  label: string;
  sidebarOpen: boolean;
}) => {
  const isNutrition = icon.includes('Vector (17)');
  return (
    <div
      className={`
        flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer
        text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all
        ${sidebarOpen ? "justify-start" : "justify-center"}
      `}
    >
      <img
        src={icon}
        className="w-6 h-6"
        style={isNutrition ? { filter: 'grayscale(100%) brightness(0.5) opacity(0.7)' } : {}}
      />
      {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
};


// ------------------------ component ------------------------
const NutritionDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [nutritionScore, setNutritionScore] = useState<number>(0);
  // Initialize with default values to ensure component renders immediately
  const [nutritionInsight, setNutritionInsight] = useState<NutritionInsight | null>({
    consumedCalories: 0,
    targetCalories: 0,
    totalTargetCalories: 0,
    protein: { consumed: 0, target: 0 },
    fat: { consumed: 0, target: 0 },
    carbs: { consumed: 0, target: 0 },
  });
  const [nutritionHistory, setNutritionHistory] = useState<MealData[]>([]);
  const [nutritionSchedule, setNutritionSchedule] = useState<ScheduledMeal[]>([]);
  const [weeklyDemoData, setWeeklyDemoData] = useState<WeeklyPoint[]>([
    { day: "Mon", calories: 1200, protein: 300, fat: 200 },
    { day: "Tue", calories: 900, protein: 250, fat: 180 },
    { day: "Wed", calories: 1500, protein: 400, fat: 300 },
    { day: "Thu", calories: 1800, protein: 500, fat: 350 },
    { day: "Fri", calories: 1300, protein: 350, fat: 240 },
    { day: "Sat", calories: 1100, protein: 280, fat: 200 },
    { day: "Sun", calories: 1600, protein: 420, fat: 300 },
  ]);
  const [activeTab, setActiveTab] = useState("home");
  const [showSchedule, setShowSchedule] = useState(false);
  
  // Onboarding state
  const [showNutritionTour, setShowNutritionTour] = useState(false);

  // NEW: selected range
  const [timeRange, setTimeRange] = useState<TimeRange>("1w");

  const [profileImage, setProfileImage] = useState<string | null>("/Avatar-1.png");

  // Check if user has seen nutrition dashboard onboarding
  useEffect(() => {
    const hasSeenNutritionTour = localStorage.getItem("hasSeenNutritionTour");
    if (!hasSeenNutritionTour) {
      // Small delay to ensure page is fully rendered
      setTimeout(() => {
        setShowNutritionTour(true);
      }, 1500);
    }
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await getUserProfile();
        // Use local fallback instead of external CDN to avoid CORS issues
        setProfileImage(
          data.profile_image_url || "/Avatar-1.png"
        );
      } catch (err) {
        console.error("Error fetching profile:", err);
        // Set fallback on error
        setProfileImage("/Avatar-1.png");
      }
    };

    loadProfile();
  }, []);


  useEffect(() => {
    let active = true;

    const load = async () => {
      const [scoreResult, insightResult, historyResult, weeklyResult] =
        await Promise.allSettled([
          fetchNutritionScore(),
          fetchNutritionInsight(),
          fetchNutritionHistory(), // shared for both
          fetchWeeklyNutrition(),
        ]);

      if (!active) return;

      if (scoreResult.status === "fulfilled") {
        setNutritionScore(scoreResult.value);
      } else {
        setNutritionScore(62.7);
      }

      if (insightResult.status === "fulfilled") {
        setNutritionInsight(insightResult.value);
      } else {
        setNutritionInsight({
          consumedCalories: 0,
          targetCalories: 0,
          totalTargetCalories: 0,
          protein: { consumed: 0, target: 0 },
          fat: { consumed: 0, target: 0 },
          carbs: { consumed: 0, target: 0 },
        });
      }

      if (historyResult.status === "fulfilled") {
        setNutritionHistory(historyResult.value);
        setNutritionSchedule(historyResult.value); // use same table for schedule
      } else {
        setNutritionHistory([]);
        setNutritionSchedule([]);
      }

      if (weeklyResult.status === "fulfilled") {
        setWeeklyDemoData(weeklyResult.value);
      } else {
        setWeeklyDemoData([
          { day: "Mon", calories: 1200, protein: 300, fat: 200 },
          { day: "Tue", calories: 900, protein: 250, fat: 180 },
          { day: "Wed", calories: 1500, protein: 400, fat: 300 },
          { day: "Thu", calories: 1800, protein: 500, fat: 350 },
          { day: "Fri", calories: 1300, protein: 350, fat: 240 },
          { day: "Sat", calories: 1100, protein: 280, fat: 200 },
          { day: "Sun", calories: 1600, protein: 420, fat: 300 },
        ]);
      }
    };

    load().catch((err) => {
      console.error("Error loading nutrition data:", err);
      // Set default values on error to ensure page renders
      setNutritionScore(0);
      setNutritionInsight({
        consumedCalories: 0,
        targetCalories: 0,
        totalTargetCalories: 0,
        protein: { consumed: 0, target: 0 },
        fat: { consumed: 0, target: 0 },
        carbs: { consumed: 0, target: 0 },
      });
      setNutritionHistory([]);
      setNutritionSchedule([]);
      setWeeklyDemoData([
        { day: "Mon", calories: 1200, protein: 300, fat: 200 },
        { day: "Tue", calories: 900, protein: 250, fat: 180 },
        { day: "Wed", calories: 1500, protein: 400, fat: 300 },
        { day: "Thu", calories: 1800, protein: 500, fat: 350 },
        { day: "Fri", calories: 1300, protein: 350, fat: 240 },
        { day: "Sat", calories: 1100, protein: 280, fat: 200 },
        { day: "Sun", calories: 1600, protein: 420, fat: 300 },
      ]);
    });
    return () => {
      active = false;
    };
  }, []);

  // Build chart based on history + selected timeRange; fallback to demo weekly
  const filteredChartData: ChartRow[] = useMemo(() => {
    const rows = buildChart(nutritionHistory, timeRange);
    if (rows.length) return rows;
    // fallback preserves previous behavior (weekly demo)
    return weeklyDemoData.map((r) => ({
      day: r.day,
      calories: r.calories,
      protein: r.protein,
      fat: r.fat,
    }));
  }, [nutritionHistory, timeRange, weeklyDemoData]);

  // Ring progress math
  const progress =
    nutritionInsight && nutritionInsight.targetCalories && nutritionInsight.targetCalories > 0
      ? Math.min(
        (nutritionInsight.consumedCalories /
          nutritionInsight.targetCalories) *
        100,
        100
      )
      : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const noInsight =
    !nutritionInsight ||
    nutritionInsight.consumedCalories === 0 ||
    (nutritionInsight.protein?.consumed === 0 &&
      nutritionInsight.fat?.consumed === 0 &&
      nutritionInsight.carbs?.consumed === 0);

  // Nutrition Dashboard Onboarding Steps
  const nutritionTourSteps: Step[] = [
    {
      target: '[data-tour="dashboard-header"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Welcome to Nutrition Dashboard!</h3>
          <p className="text-sm text-gray-600">
            This is your nutrition hub. Here you can track your meals, set goals, and monitor your progress.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="add-meal"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Add Your Meals</h3>
          <p className="text-sm text-gray-600">
            Click here to log your meals and track your daily nutrition. Add breakfast, lunch, dinner, and snacks!
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="set-goal"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Set Your Goals</h3>
          <p className="text-sm text-gray-600">
            Set your daily calorie and macro targets based on your health goals. Customize your nutrition plan!
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="schedule-meal"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Schedule Your Meals</h3>
          <p className="text-sm text-gray-600">
            Plan your meals in advance! Schedule breakfast, lunch, dinner, and snacks to stay organized and meet your goals.
          </p>
        </div>
      ),
      placement: 'left',
    },
  ];

  const handleNutritionTourComplete = () => {
    localStorage.setItem('hasSeenNutritionTour', 'true');
    setShowNutritionTour(false);
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 flex flex-col transition-all duration-300 ${sidebarOpen ? "md:ml-60" : "md:ml-20"
        }`}
    >
      {/* HAMBURGER FIXED BUTTON */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed w-5 h-5 top-5 left-6 z-[400] bg-white p-2 md:flex hidden"
      >
        ☰
      </button>

      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="w-full flex flex-col relative" style={{ height: "100vh", overflow: "hidden" }}>
        {/* Scrollable content container - starts from top */}
        <div
          className="overflow-y-auto w-full"
          style={{ height: "100vh" }}
        >
          {/* Top Navigation Bar - Sticky with transparent backdrop */}
          <div className="sticky top-0 z-30 flex items-center w-full p-4 md:px-6 md:py-4 bg-white/40 backdrop-blur-md supports-[backdrop-filter]:bg-white/30 border-b border-white/20 relative">
            {/* Left side - Back button and Profile */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Back Button - Mobile */}
              <Link
                to="/welcome"
                className="md:hidden p-2 -ml-2 hover:bg-white/50 rounded-full transition flex-shrink-0"
                aria-label="Go back"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              {/* Back Button - Desktop */}
              <Link
                to="/welcome"
                className="hidden md:block p-2 hover:bg-white/50 rounded-full transition"
                aria-label="Go back"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden border-0">
                <img
                  src={profileImage || "/Avatar-1.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to local avatar if image fails to load
                    const target = e.target as HTMLImageElement;
                    if (target.src !== "/Avatar-1.png") {
                      target.src = "/Avatar-1.png";
                    }
                  }}
                />
              </div>
            </div>

            {/* Center - Title */}
            <h1 className="text-gray-800 font-semibold text-2xl text-center flex-1 absolute left-1/2 transform -translate-x-1/2" data-tour="dashboard-header">Nutrition</h1>
            
            {/* Right side - Bell icon */}
            <div className="flex-shrink-0 ml-auto flex items-center gap-3">
              <Link to="" className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/bell.png" 
                  width="24" 
                  height="24" 
                  alt="Notifications"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </Link>
            </div>
          </div>

          {/* main grid - scrollable content that goes behind topbar */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6 pb-20 md:pb-6"
          >
            {/* LEFT column */}
            <div className="space-y-6 md:col-start-1 md:col-end-2">
              {/* Nutrition Score + Chart card */}
              <div className="bg-white rounded-2xl p-5 text-center">
                <img 
                  src="/leaf single.png" 
                  className="w-10 h-10 mx-auto mb-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <h2 className="text-black font-bold text-5xl mb-1">
                  {Number.isFinite(nutritionScore) ? nutritionScore : 0}
                </h2>
                <p className="text-gray-900 font-semibold text-lg mb-1">Nutrition Score</p>
                <p className="text-gray-600 text-sm mb-4">You are more active than usual this week.</p>

                {/* Chart */}
                <div className="rounded-2xl p-1" style={{ height: 300 }}>
                  <ResponsiveContainer width="110%" className="-ml-8" height="100%">
                    <BarChart data={filteredChartData} barSize={13}>
                      <CartesianGrid
                        stroke="#E5E7EB"
                        strokeDasharray="4 4"
                        vertical={true}
                        horizontal={true}
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, "auto"]}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip cursor={{ fill: "#F3F4F6" }} />
                      <Bar dataKey="calories" stackId="a" fill="#2563EB" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="protein" stackId="a" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="fat" stackId="a" fill="#BFDBFE" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="flex justify-center gap-6 mt-2 text-sm text-gray-900 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#2563EB] rounded-full inline-block" />
                      <span>Calories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#60A5FA] rounded-full inline-block" />
                      <span>Protein</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-[#BFDBFE] rounded-full inline-block" />
                      <span>Fat</span>
                    </div>
                  </div>
                </div>

                {/* Time filter */}
                <div className="bg-blue-50 rounded-2xl h-10 ">
                  <div className="flex justify-center gap-2 md:gap-4 mt-[50px]">
                    {(["1d", "1w", "1m", "1y"] as TimeRange[]).map((label) => (
                      <button
                        key={label}
                        onClick={() => setTimeRange(label)}
                        className={`mt-2 text-sm px-3 py-1 rounded-full transition-colors ${timeRange === label
                          ? "bg-white text-black border border-gray-200 shadow-sm"
                          : "text-gray-600 hover:text-black"
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      onClick={() => setTimeRange("all")}
                      className={`mt-1 text-sm px-4 py-1 rounded-full border ${timeRange === "all"
                        ? "bg-white text-black border-gray-200 shadow-sm"
                        : "bg-white text-black border-gray-200 shadow-sm"
                        }`}
                    >
                      All Time
                    </button>
                  </div>
                </div>
              </div>

              {/* Nutrition Insight */}
              <div className=" p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 font-semibold text-lg">Nutrition Insight</h3>
                  <Link to="/nutrition-insight" className="text-blue-500 text-sm font-medium hover:underline">
                    See All
                  </Link>
                </div>

                {noInsight ? (
                  <div className="w-full bg-white rounded-2xl p-6 flex items-center justify-between shadow-md border border-gray-100">
                    <div>
                      <p className="text-gray-700 text-sm mb-1">Not enough data to show nutrition insignt</p>
                      <Link to="/nutrition-goal" data-tour="set-goal" className="text-blue-600 text-sm mt-3 font-semibold flex items-center gap-1">
                        Set Up Goal
                        <img 
                          src="/arrow right.png" 
                          className="w-3 h-3"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </Link>
                    </div>
                    <img 
                      src="/nutrition-insight.png" 
                      className="w-30 h-28 object-contain select-none" 
                      alt="empty"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="shadow-md bg-white rounded-2xl p-5">
                      <div className="flex items-center justify-between px-2 md:px-4 relative">
                        <div className="text-center flex-1">
                          <p className="text-gray-700 font-semibold text-base md:text-lg">
                            {nutritionInsight!.consumedCalories}
                          </p>
                          <p className="text-gray-500 text-xs md:text-sm">consumed</p>
                        </div>

                        <div className="relative flex items-center justify-center flex-1">
                          <svg className="w-32 h-32 md:w-40 md:h-40 transform -rotate-90">
                            <circle cx="64" cy="64" r="48" stroke="#E5E7EB" strokeWidth="6" fill="transparent" className="md:hidden" />
                            <circle cx="80" cy="80" r="60" stroke="#E5E7EB" strokeWidth="8" fill="transparent" className="hidden md:block" />
                            <circle
                              cx="64"
                              cy="64"
                              r="48"
                              stroke="#2563EB"
                              strokeWidth="6"
                              fill="transparent"
                              strokeDasharray={2 * Math.PI * 48}
                              strokeDashoffset={(2 * Math.PI * 48) - (progress / 100) * (2 * Math.PI * 48)}
                              strokeLinecap="round"
                              className="transition-all duration-700 md:hidden"
                            />
                            <circle
                              cx="80"
                              cy="80"
                              r="60"
                              stroke="#2563EB"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              className="transition-all duration-700 hidden md:block"
                            />
                          </svg>

                          <div className="absolute inset-0 flex items-center justify-center text-center">
                            <div>
                              <p className="font-bold text-xl md:text-3xl text-gray-800">
                                {nutritionInsight!.consumedCalories.toLocaleString()}
                              </p>
                              <p className="text-gray-500 text-xs md:text-sm">kcal total</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-center flex-1">
                          <p className="text-gray-700 font-semibold text-base md:text-lg">{nutritionInsight!.targetCalories}</p>
                          <p className="text-gray-500 text-xs md:text-sm">target</p>
                        </div>
                      </div>

                      <div className="flex justify-between px-6 mt-6 text-gray-700 font-medium text-sm">
                        <span>Protein</span>
                        <span>Fat</span>
                        <span>Carbs</span>
                      </div>

                      <div className="flex justify-between px-4 mt-2">
                        <div className="flex flex-col items-center w-1/3">
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{
                                width: `${(nutritionInsight!.protein.consumed / nutritionInsight!.protein.target) * 100
                                  }%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-gray-700 text-sm font-bold">
                            {nutritionInsight!.protein.consumed}/{nutritionInsight!.protein.target}g
                          </p>
                        </div>

                        <div className="flex flex-col items-center w-1/3">
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1 ml-2">
                            <div
                              className="h-full bg-green-600 rounded-full"
                              style={{
                                width: `${(nutritionInsight!.fat.consumed / nutritionInsight!.fat.target) * 100
                                  }%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-gray-700 text-sm font-bold">
                            {nutritionInsight!.fat.consumed}/{nutritionInsight!.fat.target}g
                          </p>
                        </div>

                        <div className="flex flex-col items-center w-1/3">
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1 ml-3">
                            <div
                              className="h-full bg-yellow-400 rounded-full"
                              style={{
                                width: `${(nutritionInsight!.carbs.consumed / nutritionInsight!.carbs.target) * 100
                                  }%`,
                              }}
                            ></div>
                          </div>
                          <p className="text-gray-700 text-sm font-bold">
                            {nutritionInsight!.carbs.consumed}/{nutritionInsight!.carbs.target}g
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-center text-sm mt-4">
                        You're on track for your calorie goal today! <br /> Keep it up, okay!
                      </p>

                      <div className="border-t pt-4 mt-4 text-center">
                        <Link
                          to="/nutrition-insight"
                          className="text-blue-600 font-semibold text-sm flex justify-center items-center gap-2 cursor-pointer"
                        >
                          See Nutrition Dashboard
                          <img src="/arrow right.png" className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Nutrition Schedule */}
              {/* <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 font-semibold text-lg">Nutrition Schedule</h3>
                <Link to="/nutrition-schedule">
                  <p className="text-blue-600 text-sm font-medium">Setup</p>
                </Link>
              </div>

              {nutritionSchedule
                .filter((meal) => isAfterNow(meal.meal_date, meal.meal_time))
                .sort((a, b) => (new Date(a.meal_date) as any) - (new Date(b.meal_date) as any))
                .slice(0, 4)
                .map((item, index) => (
                  <Link
                    to={`/meal-details?id=${item.id}`}
                    key={index}
                    className="flex items-center justify-between bg-white rounded-2xl p-4 mb-4 shadow-md cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <img src="/schedule.png" alt="meal" className="w-5 h-5 object-contain" />
                      </div>

                      <div>
                        <p className="text-gray-500 text-xs font-medium">{item.meal_time}</p>
                        <p className="text-gray-900 font-semibold text-sm mt-0.5">{item.meal_name}</p>

                        <div className="flex items-center gap-5 mt-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <img src="/fire.png" className="w-3.5 h-3.5" />
                            <span>{item.calories}k</span>
                          </div>
                          <span>{item.protein}p</span>
                          <span>{item.fat}f</span>
                          <span>{item.carbs}c</span>
                        </div>
                      </div>
                    </div>

                    <img src="/arrow.png" alt="arrow" />
                  </Link>
                ))}

              {nutritionSchedule.filter((m) => isAfterNow(m.meal_date, m.meal_time)).length === 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-md">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#FFECEC] flex items-center justify-center mb-3">
                    <svg width="24" height="24" stroke="red" fill="none" strokeWidth="2">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="6" y1="18" x2="18" y2="6" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-bold">No upcoming meals</p>
                  <p className="text-gray-500 text-sm mt-1">You have no future meals scheduled.</p>
                </div>
              )}
            </div> */}
            </div>

            {/* RIGHT column */}
            <div className="space-y-6 p-5 md:col-start-2 md:col-end-3">
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-gray-900 font-semibold text-lg">Nutrition Schedule</h3>
                  <button
                    onClick={() => setShowSchedule(true)}
                    data-tour="schedule-meal"
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Setup
                  </button>

                </div>

                {nutritionSchedule
                  .filter((meal) => isAfterNow(meal.meal_date, meal.meal_time))
                  .sort((a, b) => (new Date(a.meal_date) as any) - (new Date(b.meal_date) as any))
                  .slice(0, 4)
                  .map((item, index) => (
                    <Link
                      to={`/meal-details?id=${item.id}`}
                      key={index}
                      className="w-full flex items-center justify-between bg-white rounded-2xl p-4 mb-4 shadow-md cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <img src="/schedule.png" alt="meal" className="w-5 h-5 object-contain" />
                        </div>

                        <div>
                          <p className="text-gray-500 text-xs font-medium">{item.meal_time}</p>
                          <p className="text-gray-900 font-semibold text-sm mt-0.5">{item.meal_name}</p>

                          <div className="flex items-center gap-5 mt-2 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <img src="/fire.png" className="w-3.5 h-3.5" />
                              <span>{item.calories}k</span>
                            </div>
                            <span>{item.protein}p</span>
                            <span>{item.fat}f</span>
                            <span>{item.carbs}c</span>
                          </div>
                        </div>
                      </div>

                      <img src="/arrow.png" alt="arrow" />
                    </Link>
                  ))}

                {nutritionSchedule.filter((m) => isAfterNow(m.meal_date, m.meal_time)).length === 0 && (
                  <div className="w-full bg-white rounded-xl border border-gray-100 p-6 text-center shadow-md">
                    <div className="mx-auto w-12 h-12 rounded-full bg-[#FFECEC] flex items-center justify-center mb-3">
                      <svg width="24" height="24" stroke="red" fill="none" strokeWidth="2">
                        <line x1="6" y1="6" x2="18" y2="18" />
                        <line x1="6" y1="18" x2="18" y2="6" />
                      </svg>
                    </div>
                    <p className="text-gray-900 font-bold">No upcoming meals</p>
                    <p className="text-gray-500 text-sm mt-1">You have no future meals scheduled.</p>
                  </div>
                )}
              </div>
                <div className="flex justify-between">
                  <div className="shadow-md rounded-2xl p-3 text-lg bg-white">
                  <Link to="/add-meal-manually" className="text-blue-500 ">Add Meal</Link>
                  </div>
                  <div className="shadow-md rounded-2xl p-3 text-lg bg-white">
                  <Link to="/nutrition-goal" className="text-blue-500 ">Edit Goal</Link>
                  </div>
                </div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-800 font-semibold text-lg">Nutrition History</h3>
                <Link to="/nutrition-history" className="text-blue-500 text-sm hover:underline">
                  See All
                </Link>
              </div>

                
              <div className="space-y-4">

                {/* If NO history found → show log card */}
                {nutritionHistory.filter((m) => isBeforeNow(m.meal_date, m.meal_time)).length === 0 ? (
                  <div className="w-full bg-white rounded-2xl p-4 flex items-center justify-center shadow-md border border-gray-100">
                    <div>
                      <p className="text-gray-700 text-sm mb-1">Log your first meal to see your history</p>
                      <Link to="/add-meal-manually" data-tour="add-meal" className="text-blue-600 text-sm mt-3 font-semibold flex items-center gap-1">
                        Log Nutrition
                        <img src="/arrow right.png" className="w-3 h-3" />
                      </Link>
                    </div>
                    <img src="/nutrition-history.png" className="w-30 h-28 object-contain select-none" alt="empty" />
                  </div>
                ) : (
                  // Existing history UI
                  nutritionHistory
                    .filter((m) => isBeforeNow(m.meal_date, m.meal_time))
                    .sort(
                      (a, b) =>
                        new Date(b.meal_date).getTime() - new Date(a.meal_date).getTime()
                    )
                    .slice(0, 4)
                    .map((meal, index) => (
                      <Link
                        to={`/meal-details?id=${meal.id}`}
                        key={index}
                        className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 cursor-pointer"
                      >
                        <div className="flex-shrink-0">
                          <img src="/apple-1.png" alt="meal" className="w-5 h-5 object-contain" />
                        </div>

                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-800 text-base font-bold">{meal.calories} kcal</p>
                              <p className="text-gray-600 text-sm mt-1">{meal.meal_name}</p>
                            </div>

                            <div className="text-right flex items-center gap-2">
                              <span className="text-gray-500 text-sm">{formatShortDate(meal.meal_date)}</span>
                              <img src="/arrow.png" alt="arrow" />
                            </div>
                          </div>

                          <div className="flex items-center gap-5 mt-3">
                            <div className="flex items-center gap-1">
                              <img src="/p.png" className="w-[18px] h-[18px]" />
                              <span className="text-gray-700 text-sm">{meal.protein}g</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <img src="/f.png" className="w-[18px] h-[18px]" />
                              <span className="text-gray-700 text-sm">{meal.fat}g</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <img src="/c.png" className="w-[18px] h-[18px]" />
                              <span className="text-gray-700 text-sm">{meal.carbs}g</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                )}
              </div>

              {/* Calorie Intake Card */}
              <div className="p-2 ">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900 font-semibold text-lg">Calorie Intake</h3>
                  <a className="text-blue-500 text-sm font-medium">See All</a>
                </div>

                <div className="relative bg-white rounded-2xl border border-gray-100 p-5 shadow-md">
                  <div className="absolute top-6 right-6 bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <img src="/fire.png" className="w-6 h-6" />
                  </div>

                  <p className="text-gray-900 font-bold text-xl">
                    {(nutritionInsight?.targetCalories || 2158).toLocaleString()} calorie
                  </p>

                  <p className="text-gray-600 text-base mt-2 leading-snug w-[85%]">
                    Based on your health state, we recommend you eat {nutritionInsight?.targetCalories || 2158}cal a day.
                  </p>

                  <div className="flex justify-between items-center mt-6  text-sm">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <img
                          src={i === 1 || i === 3 ? "/red-tick.png" : "/green-tick.png"}
                          className="w-6 h-6"
                        />
                        <span className="text-[12px] font-bold tracking-wider text-[#4A4A4A] leading-none">
                          {d}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Nutrition Schedule Overlay ================= */}
        {/* ================= FULL PAGE STACKED OVERLAY ================= */}
       {/* ================= RIGHT DRAWER ================= */}
<div
  className={`fixed inset-0 z-50 transition-all duration-300 ${
    showSchedule ? "pointer-events-auto" : "pointer-events-none"
  }`}
>
  {/* BACKDROP */}
  <div
    onClick={() => setShowSchedule(false)}
    className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
      showSchedule ? "opacity-100" : "opacity-0"
    }`}
  />

  {/* DRAWER */}
  <div
    className={`
      absolute top-0 right-0 h-full
      w-full md:w-[85%]
      bg-white shadow-2xl
      rounded-l-3xl
      transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
      ${showSchedule ? "translate-x-0" : "translate-x-full"}
    `}
  >
    <NutritionSchedule onClose={() => setShowSchedule(false)} />
  </div>
</div>


        {/* Nutrition Dashboard Onboarding Tour */}
        <OnboardingTour
          steps={nutritionTourSteps}
          run={showNutritionTour}
          onComplete={handleNutritionTourComplete}
          onSkip={handleNutritionTourComplete}
        />

        {/* bottom navigation */}
        <nav className="flex justify-around items-center bg-white/95 backdrop-blur-md border-t border-gray-200 fixed bottom-0 left-0 right-0 h-16 shadow-lg md:hidden z-30">
          <Link to="/welcome"
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center text-xs ${activeTab === "home" ? "text-blue-500" : "text-gray-500"}`}
          >
            <img src="/home.png" alt="home" className={`icon ${activeTab === "home" ? "icon-blue" : "icon-grey"}`} />
            Home
          </Link>

          <Link to="/wellness/ai-chat"
            onClick={() => setActiveTab("assistant")}
            className={`flex flex-col items-center text-xs ${activeTab === "assistant" ? "text-blue-500" : "text-gray-500"
              }`}
          >
            <img
              src="/ai-pic.png"
              alt="assistant"
              className={`icon ${activeTab === "assistant" ? "icon-blue" : "icon-grey"}`}
            />
            AI Assistant
          </Link>

          <img src="/plus-btn.png" alt="plus" className="w-14 h-14 -mt-6" />

          <button
            onClick={() => setActiveTab("resources")}
            className={`flex flex-col items-center text-xs ${activeTab === "resources" ? "text-blue-500" : "text-gray-500"
              }`}
          >
            <img
              src="/resources.png"
              alt="resources"
              className={`icon ${activeTab === "resources" ? "icon-blue" : "icon-grey"}`}
            />
            My Bookings
          </button>

          <Link to="/wellness/settings"
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center text-xs ${activeTab === "profile" ? "text-blue-500" : "text-gray-500"
              }`}
          >
            <img
              src="/profile.png"
              alt="profile"
              className={`icon ${activeTab === "profile" ? "icon-blue" : "icon-grey"}`}
            />
            Profile
          </Link >
        </nav>
      </div>

      {/* Nutrition Dashboard Onboarding Tour */}
      <OnboardingTour
        steps={nutritionTourSteps}
        run={showNutritionTour}
        onComplete={handleNutritionTourComplete}
        onSkip={handleNutritionTourComplete}
      />
    </div>
  );
};

export default NutritionDashboard;
