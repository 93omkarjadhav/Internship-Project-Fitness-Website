// src/pages/NutritionInsight.tsx
import "react-datepicker/dist/react-datepicker.css";
import {
  IoChevronBack, IoCalendarOutline, IoAnalyticsOutline, IoRestaurantOutline,
  IoFootstepsOutline, IoTimeOutline, IoInformationCircleOutline
} from 'react-icons/io5';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
// import { Link } from "lucide-react";
import { Link } from "react-router-dom";
import { IoChevronDown } from "react-icons/io5";
import { fetchNutritionInsight, fetchNutritionScore, fetchWeeklyNutrition, NutritionInsight as InsightType, WeeklyPoint } from "../lib/api";

// This is the main page component (using default export)
export default function NutritionInsight() {
  const [insight, setInsight] = useState<InsightType | null>(null);
  const [score, setScore] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([fetchNutritionInsight(), fetchNutritionScore(), fetchWeeklyNutrition()]).then(
      ([insightResult, scoreResult, weeklyResult]) => {
        if (!active) return;
        if (insightResult.status === 'fulfilled') {
          setInsight(insightResult.value);
        } else {
          setFetchError('Unable to load nutrition insight.');
        }
        if (scoreResult.status === 'fulfilled') {
          setScore(scoreResult.value);
        }
        if (weeklyResult.status === 'fulfilled') {
          setWeeklyData(weeklyResult.value);
        }
        setLoading(false);
      }
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent md:bg-gray-100 flex flex-col items-center justify-center p-0 md:p-4">

      <div className=" bg-transparent md:bg-white md:rounded-2xl md:shadow-lg p-0 w-full md:max-w-4xl flex flex-col">
        <div className='bg-blue-50'>
          <PageHeader />
          <InsightHeader />
        </div>

        {/* Responsive Content Grid:
        - Mobile (default): A single column (flex flex-col)
        - Desktop (lg:): A 2-column grid
      */}
        <div className="p-4 flex bg-gray-50 flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:p-6">
          <NutritionSection insight={insight} score={score} loading={loading} error={fetchError} />

          {/* On desktop, the two "Calorie Intake" boxes will stack vertically */}
          <div className="">
            <CalorieIntakeCard insight={insight} loading={loading} />
          </div>

          <AverageStepsCard weekly={weeklyData} />
          <FavoriteMealCard />

          {/* This footer spans both columns on desktop */}
          <StatusFooter />
        </div>

      </div>
    </div>
  );
}

// --- Page Header ---
function PageHeader() {
  return (
    <header className="sticky top-0 z-10 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link
          to="/nutrition-dashboard"
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Go back"
        >
          <IoChevronBack className="w-6 h-6 text-gray-800" />
        </Link>
        <div className="w-6 h-6"></div> {/* Spacer */}
      </div>
    </header>
  );
}

// --- Title, Description, Date ---
// import { useState } from "react";
// import { IoChevronDown } from "react-icons/io5";

function InsightHeader() {
  const [date, setDate] = useState(new Date("2025-01-01"));

  return (
    <div className="flex flex-col items-center p-4 text-center border-b border-gray-100 bg-blue-50">

      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 mb-2">
        <img src="/light bulb active.png" />
      </div>

      <h2 className="text-2xl font-semibold text-gray-900">Nutrition Insight</h2>

      <p className="text-sm text-gray-600 mt-2 max-w-xs">
        Track and analyze your key health indicators to optimize your wellness journey.
      </p>

      {/* --- Date Picker Box --- */}

      <DatePicker
        selected={date}
        onChange={(val) => setDate(val!)}
        dateFormat="MMMM yyyy"
        showMonthYearPicker
        popperPlacement="bottom"
        // hide native input
        customInput={
          <div
            className="
        w-[400px]
        bg-blue-50
        border border-blue-200 
        rounded-2xl 
        px-5 py-4 
        flex items-center justify-between
        shadow-sm 
        cursor-pointer 
        mt-6
      "
          >
            {/* Left side: calendar icon + text */}
            <div className="flex items-center gap-3">
              <img
                src="/icons/calendar-d.png"
                className="w-5 h-5"
                alt=""
              />
              <span className="text-gray-700 font-semibold text-[15px]">
                {date.toLocaleString("default", { month: "long", year: "numeric" })}
              </span>
            </div>

            {/* Down arrow */}
            <img
              src="/icons/down-arr.png"
              className="w-4 h-4"
              alt=""
            />
          </div>
        }
      />



    </div>
  );
}

// export default InsightHeader;


// --- Card 1: Overview ---
const overviewData = [{ name: 'Consumed', value: 2181 }, { name: 'Remaining', value: (2500 - 2181) }];
const OVERVIEW_COLORS = ['#2563eb', '#e5e7eb']; // Tailwind blue-600 and gray-200

const NutritionSection = ({
  insight,
  score,
  loading,
  error,
}: {
  insight: InsightType | null;
  score: number;
  loading: boolean;
  error: string | null;
}) => {
  const target = insight?.targetCalories ?? insight?.totalTargetCalories ?? 0;
  const consumed = insight?.consumedCalories ?? 0;
  const progress = target ? Math.min(consumed / target, 1) : 0;
  const circumference = 2 * Math.PI * 60;
  const macros = [
    { label: 'Protein', consumed: insight?.protein.consumed ?? 0, target: insight?.protein.target ?? 1, color: 'bg-red-500' },
    { label: 'Fat', consumed: insight?.fat.consumed ?? 0, target: insight?.fat.target ?? 1, color: 'bg-yellow-400' },
    { label: 'Carbs', consumed: insight?.carbs.consumed ?? 0, target: insight?.carbs.target ?? 1, color: 'bg-green-600' },
  ];

  return (
    <div className="mt-4 mb-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex gap-2">
          <img src="/icons/light bulb.png" className='w-7' alt="overview" />
          <h2 className='font-semibold text-lg text-gray-900'>Overview</h2>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading insight...</div>
        ) : !insight ? (
          <div className="text-center text-red-500 py-10">{error ?? 'No data available today.'}</div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4">
              <div className="text-center">
                <p className="text-gray-700 font-semibold text-lg">{consumed}</p>
                <p className="text-gray-500 text-sm">consumed</p>
              </div>

              <div className="relative flex items-center justify-center">
                <svg className="w-40 h-40 -rotate-90">
                  <circle cx="80" cy="80" r="60" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    stroke="#2563EB"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={(1 - progress) * circumference}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute text-center">
                  <p className="text-3xl font-bold text-gray-900">{consumed.toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">kcal total</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-700 font-semibold text-lg">{target}</p>
                <p className="text-gray-500 text-sm">target</p>
              </div>
            </div>

            <Macros macros={macros} />

            <p className="text-gray-600 text-center text-sm mt-4">
              Your nutrition score is {score}. Keep the momentum going!
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const Macros = ({
  macros,
}: {
  macros: { label: string; consumed: number; target: number; color: string }[];
}) => (
  <>
    <div className="flex justify-between px-6 mt-6 text-gray-700 font-medium text-sm">
      {macros.map((macro) => (
        <span key={macro.label}>{macro.label}</span>
      ))}
    </div>

    <div className="flex justify-between px-4 mt-2">
      {macros.map((macro) => {
        const percent = macro.target ? Math.min((macro.consumed / macro.target) * 100, 100) : 0;
        return (
          <div className="flex flex-col items-center w-1/3" key={macro.label}>
            <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1">
              <div className={`h-full rounded-full ${macro.color}`} style={{ width: `${percent}%` }}></div>
            </div>
            <p className="text-gray-700 text-sm font-bold">
              {Math.round(macro.consumed)}/{Math.round(macro.target)}g
            </p>
          </div>
        );
      })}
    </div>
  </>
);
// --- Helper: Progress Bar ---
interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}
// function ProgressBar({ label, value, total, color }: ProgressBarProps) {
//   const percent = (value / total) * 100;
//   return (
//     <div>
//       <div className="flex justify-between text-xs text-gray-600 mb-1.5">
//         <span>{label}</span>
//         <span><strong className="text-gray-900">{value}</strong>/{total}g</span>
//       </div>
//       <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//         <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
//       </div>
//     </div>
//   );
// }

// --- Card 2: Calorie Intake ---
function CalorieIntakeCard({ insight, loading }: { insight: InsightType | null; loading: boolean }) {
  const consumed = insight?.consumedCalories ?? 0;
  const target = insight?.targetCalories ?? 0;
  return (
    <>
      <div className=" w-full mt-3  bg-white rounded-3xl shadow-md p-6">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <img src="/icons/fire.png" className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-gray-900">Calorie Intake</h3>
        </div>

        {/* Two Stats */}
        <div className="grid grid-cols-2 w-40 justify-between gap-40">

          {/* LEFT SIDE */}
          <div className="flex w-50 flex-col items-start">
            <div className="w-10 h-10 rounded-full  flex items-center justify-center mb-3">
              <img src="/icons/avg icon.png" />
            </div>

            <p className="text-sm">Avg consumed</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {loading ? '--' : consumed} <span className="text-sm font-normal">kcal</span>
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col  items-start">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3">
              <img src="/icons/clock blue.png" />
            </div>

            <p className="text-sm ">Total consumed</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">
              {loading ? '--' : target} <span className="text-sm font-normal">kcal</span>
            </p>
          </div>

        </div>
      </div>

    </>
  );
}

// --- Card 3: Average Steps ---
const ACTIVE_COLOR = "#2563eb";
const DEFAULT_COLOR = "#bfdbfe";

function AverageStepsCard({ weekly }: { weekly: WeeklyPoint[] }) {
  const barData = weekly.length
    ? weekly.map((entry) => ({
      day: entry.day.slice(0, 1),
      steps: Math.round(entry.calories),
    }))
    : [{ day: '—', steps: 0 }];
  const avg = weekly.length
    ? Math.round(weekly.reduce((sum, entry) => sum + entry.calories, 0) / weekly.length)
    : 0;

  return (
    <div className="shadow-md bg-white rounded-2xl p-4 ">
      <div className="flex items-center gap-2 text-base font-semibold  mb-1">
        {/* <IoFootstepsOutline /> */}
        <img src="/icons/foot step double.png" alt="" />
        <h3>Average Calories Consumed</h3>
      </div>
      <div className="text-3xl font-bold text-gray-900">{avg.toLocaleString()}</div>
      <p className='font-semibold'>Avg Calories</p>
      <p className="text-sm text-gray-600">You are on track towards your goal!</p>

      {/* Bar Chart */}
      {/* Bar Chart (Exact Figma Style) */}
      <div className="w-full h-40 mt-4 relative">

        {/* Center horizontal line */}
        <div className="absolute left-0 right-0 top-1/2 border-t border-blue-300"></div>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              interval={0}
              fontSize={12}
              padding={{ left: 5, right: 5 }}
            />

            <Tooltip cursor={false} />

            <Bar
              dataKey="steps"
              radius={[20, 20, 20, 20]}      // softer rounded ends
              barSize={10}                    // thinner bars like Figma
            >
              {barData.map((entry, index) => {
                const isPeak = entry.steps > avg;
                return (
                  <Cell
                    key={index}
                    fill={isPeak ? ACTIVE_COLOR : "rgba(37,99,235,0.25)"}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-gray-600 mt-4">You're doing great! Try adding a 10-minute walk after lunch to hit your goal</p>
    </div>
  );
}

// --- Card 4: Most Favorite Meal ---
function FavoriteMealCard() {
  return (
    <div className="shadow-md bg-white rounded-2xl p-4 ">
      <div className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-4">
        {/* <IoRestaurantOutline /> */}
        <img src="/icons/meal.png" alt="" />
        <h3>Most Favorite Meal</h3>
      </div>
      {/* This is a static layout, not a real chart */}
      <div className="relative h-56 flex items-center justify-center">
        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-blue-100 text-blue-400 flex items-center justify-center font-semibold text-lg">Omelette</div>
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-yellow-100 text-yellow-400 flex items-center justify-center font-medium">Noodle</div>
        <div className="absolute bottom-4 right-8 w-20 h-20 rounded-full bg-pink-100 text-pink-400 flex items-center justify-center font-medium">Pie</div>
        <div className="absolute top-2 left-8 w-20 h-20 rounded-full bg-cyan-100 text-cyan-300 flex items-center justify-center font-medium">Jelly</div>
        <div className="absolute bottom-6 left-2 w-20 h-20 rounded-full bg-green-100 text-green-400 flex items-center justify-center font-medium">Fruit</div>
        <div className="absolute top-0 right-0 w-12 h-12 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium text-sm">Nut</div>
      </div>
      {/* <p className=" text-sm text-grey-500 py-4 lg:col-span-2">
        You recorded your blood pressure 4 days in the past week.
      </p> */}
    </div>
  );
}

// --- Status Footer ---
function StatusFooter() {
  return (
    <></>
  );
}