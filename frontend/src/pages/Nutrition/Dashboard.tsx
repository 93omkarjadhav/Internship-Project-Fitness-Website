import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchNutritionInsight, fetchNutritionScore, NutritionInsight } from "../lib/api";
import { IoChevronBack } from "react-icons/io5";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const fallbackInsight: NutritionInsight = {
    consumedCalories: 0,
    targetCalories: 0,
    totalTargetCalories: 2081,
    protein: { consumed: 0, target: 0 },
    fat: { consumed: 0, target: 0},
    carbs: { consumed: 0, target: 0 },
  };

  const [insight, setInsight] = useState<NutritionInsight>(fallbackInsight);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [insightResult, scoreResult] = await Promise.allSettled([
          fetchNutritionInsight(),
          fetchNutritionScore(),
        ]);

        if (active && insightResult.status === "fulfilled") {
          setInsight(insightResult.value);
        }
        if (active && scoreResult.status === "fulfilled") {
          setScore(scoreResult.value);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const consumedCalories = insight.consumedCalories;
  const totalCalories = insight.consumedCalories;
  const targetCalories = insight.targetCalories;

  // Macros
  const proteinPercent = (insight.protein.consumed / insight.protein.target) * 100;
  const fatPercent = (insight.fat.consumed / insight.fat.target) * 100;
  const carbsPercent = (insight.carbs.consumed / insight.carbs.target) * 100;

  // Circle Progress (Desktop + Mobile)
  const circleRadius = 80;
  const circumference = 2 * Math.PI * circleRadius;
  const progress = Math.min((consumedCalories / targetCalories) * 100, 100);
  const strokeOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen md:h-screen bg-[#F5F7FA] flex flex-col items-center md:pt-4 overflow-hidden">

      {/* MOBILE VIEW */}
      <div className="w-full max-w-md px-6 md:hidden">
        {/* Back Button */}
        <button
          onClick={() => navigate("/nutrition/food-allergies")}
          className="mb-4 p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Go back"
        >
          <IoChevronBack className="w-6 h-6 text-gray-800" />
        </button>

        <img src="/logo.png" className="w-16 h-16 mb-6" />

        <h1 className="text-[22px] font-semibold leading-snug text-[#1E1E1E] mb-6">
          OK Mori, here’s your nutrition recommendation based on your health data!
        </h1>

        {/* MOBILE CARD */}
        <div className="bg-white rounded-3xl shadow-md px-6 pt-8 pb-10">

          {/* MOBILE TOP ROW */}
          <div className="flex items-center justify-between w-full mb-6 px-2">

            <div className="flex flex-col items-start w-1/4">
              <p className="text-lg font-semibold">{consumedCalories}</p>
              <span className="text-xs text-gray-500">consumed</span>
            </div>

            {/* MOBILE PROGRESS CIRCLE */}
            <div className="w-2/4 flex flex-col items-center relative">
              <svg width="140" height="140" className="-rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  stroke="#DCE3F0"
                  strokeWidth="12"
                  fill="none"
                />

                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  stroke="#3B82F6"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div>
                  <p className="text-2xl font-bold">{totalCalories}</p>
                  <p className="text-xs text-gray-500">kcal total</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end w-1/4">
              <p className="text-lg font-semibold">{targetCalories}</p>
              <span className="text-xs text-gray-500">target</span>
            </div>
          </div>

          {/* MOBILE MACROS */}
          <div className="mt-8 flex justify-between text-sm font-medium px-2">
            <span>Protein</span>
            <span>Fat</span>
            <span>Carbs</span>
          </div>

          <div className="flex justify-between mt-3 px-2 text-gray-700">

            <div className="flex flex-col items-center w-1/3">
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${proteinPercent}%` }} />
              </div>
              <p className="text-xs mt-1">
                {insight.protein.consumed}/{insight.protein.target}g
              </p>
            </div>

            <div className="flex flex-col items-center w-1/3">
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500" style={{ width: `${fatPercent}%` }} />
              </div>
              <p className="text-xs mt-1">
                {insight.fat.consumed}/{insight.fat.target}g
              </p>
            </div>

            <div className="flex flex-col items-center w-1/3">
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400" style={{ width: `${carbsPercent}%` }} />
              </div>
              <p className="text-xs mt-1">
                {insight.carbs.consumed}/{insight.carbs.target}g
              </p>
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-6 text-center leading-snug">
            {loading
              ? "Fetching your latest nutrition data..."
              : `You scored ${score ?? 0} today. Keep it up!`}
          </p>

          <hr className="my-6" />

          <Link
            to="/nutrition-dashboard"
            className="text-blue-600 flex font-semibold text-sm text-center justify-center gap-2"
          >
            See Nutrition Dashboard
            <img src="/arrow right.png" className="w-5 h-5" />
          </Link>
        </div>

        {/* Mobile Finish Button */}
        <div className="w-full mt-6 md:hidden flex justify-end">
          <Link to="/nutrition/home">
          <button className="bg-blue-600 text-white text-lg gap-2 flex font-semibold py-3 px-8 rounded-xl shadow-md ml-40">
            Finish <img src="/arr-white.png" className="h-3.5 mt-2" />
          </button>
          </Link>
        </div>
      </div>

      {/* ========================= DESKTOP VIEW ========================== */}
      <div className="hidden md:flex flex-col items-center w-full max-w-2xl bg-white rounded-3xl shadow-lg px-10 py-8 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate("/welcome")}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Go back"
        >
          <IoChevronBack className="w-6 h-6 text-gray-800" />
        </button>

        <img src="/logo.png" className="w-20 h-20 mb-6" />

        <h1 className="text-3xl font-semibold text-center mb-10 text-[#1E1E1E]">
          OK Mori, here’s your nutrition recommendation based on your health data!
        </h1>

        {/* DESKTOP TOP */}
        <div className="flex items-center justify-evenly w-full mb-6">

          <div className="flex flex-col items-center">
            <p className="text-xl font-semibold">{consumedCalories}</p>
            <span className="text-gray-500">consumed</span>
          </div>

          {/* DESKTOP DYNAMIC BLUE CIRCLE */}
          <div className="flex flex-col items-center relative">
            <svg width="200" height="200" className="-rotate-90">
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#DCE3F0"
                strokeWidth="14"
                fill="none"
              />

              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#3B82F6"
                strokeWidth="10"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>

            <div className="absolute text-center mt-[75px]">
              <p className="text-4xl font-bold">{totalCalories}</p>
              <p className="text-gray-500">kcal total</p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-xl font-semibold">{targetCalories}</p>
            <span className="text-gray-500">target</span>
          </div>
        </div>

        {/* MACROS DESKTOP */}
        <div className="mt-6 flex justify-between w-full text-gray-700 font-medium px-4 mb-3">
          <span className="ml-12">Protein</span>
          <span className="mr-11">Fat</span>
          <span className="mr-12">Carbs</span>
        </div>

        <div className="flex justify-between w-full text-gray-600 px-4">

          <div className="flex flex-col items-center w-1/3">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: `${proteinPercent}%` }} />
            </div>
            <p className="text-sm mt-1 font-bold">
              {insight.protein.consumed}/{insight.protein.target}g
            </p>
          </div>

          <div className="flex flex-col items-center w-1/3">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600" style={{ width: `${fatPercent}%` }} />
            </div>
            <p className="text-sm mt-1 font-bold">
              {insight.fat.consumed}/{insight.fat.target}g
            </p>
          </div>

          <div className="flex flex-col items-center w-1/3">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400" style={{ width: `${carbsPercent}%` }} />
            </div>
            <p className="text-sm mt-1 font-bold">
              {insight.carbs.consumed}/{insight.carbs.target}g
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-[15px] mt-8 leading-snug">
          {loading
            ? "Fetching your latest nutrition data..."
            : `You scored ${score ?? 0} today. Keep it up!`}
        </p>

        <Link
          to="/nutrition-dashboard"
          className="mt-6 text-blue-600 font-semibold text-lg text-center flex justify-center items-center gap-2"
        >
          See Nutrition Dashboard
          <img src="/arrow right.png" className="w-5 h-5" />
        </Link>
      </div>

      {/* DESKTOP FINISH BUTTON */}
      <div className="hidden md:flex w-full justify-center mt-2 mb-4">
        <Link to="/nutrition/home" className="bg-blue-600 text-white flex gap-2 text-lg font-semibold py-3 px-10 rounded-xl shadow-md hover:bg-blue-700 transition">
          Finish <img src="/arr-white.png" className="mt-2 h-4" />
        </Link>
      </div>

    </div>
  );
};

export default Dashboard;
