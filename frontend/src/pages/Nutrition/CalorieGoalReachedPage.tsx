import React, { useEffect, useState } from "react";
import { fetchNutritionInsight, NutritionInsight } from "../lib/api";
import { Link } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";

export default function CalorieGoalReachedPage() {
  const [insight, setInsight] = useState<NutritionInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchNutritionInsight()
      .then((data) => {
        if (active) setInsight(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center">
      <div className="hidden md:block w-full max-w-xl bg-white rounded-3xl shadow-lg p-8 mt-10">
        <GoalReachedContent insight={insight} loading={loading} />
      </div>
      <div className="md:hidden w-full p-6">
        <GoalReachedContent insight={insight} loading={loading} />
      </div>
    </div>
  );
}

function GoalReachedContent({ insight, loading }: { insight: NutritionInsight | null; loading: boolean }) {
  const macroCards = [
    { label: "Calories", value: insight?.consumedCalories ?? 0, suffix: "kcal", icon: "/icons/fire red.png" },
    { label: "Fat", value: insight?.fat.consumed ?? 0, suffix: "g", icon: "/icons/drop purple.png" },
    { label: "Protein", value: insight?.protein.consumed ?? 0, suffix: "g", icon: "/icons/bone.png" },
  ];

  return (
    <div className="w-full text-center">
      {/* Back Button */}
      <div className="flex justify-start mb-4">
        <Link
          to="/nutrition-dashboard"
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition inline-flex"
          aria-label="Go back"
        >
          <IoChevronBack className="w-6 h-6 text-gray-800" />
        </Link>
      </div>

      {/* IMAGE + WHITE CIRCLE OVERLAY */}
      <div className="relative flex justify-center mt-4">
        
        {/* Background colorful image */}
        <img
          src="/Group.png"   // ← Replace with your image
          className="w-72 h-72 object-contain"
          alt=""
        />

        {/* White circle overlay */}
        <div
          className="
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white rounded-full shadow-md
            w-48 h-48 flex flex-col items-center justify-center
          "
        >
          <span className="text-4xl font-bold text-gray-900">
            {loading ? "--" : insight?.consumedCalories ?? 0}
          </span>
          <span className="text-gray-600 text-lg">Total Kcal</span>
        </div>
      </div>

      {/* TITLE */}
      <h2 className="text-2xl font-semibold text-gray-900 mt-6">
        Calorie goal reached!
      </h2>

      {/* MACROS SECTION */}
      <div className="flex justify-between mt-10 px-2">
        {macroCards.map((card) => (
          <div className="flex flex-col items-center" key={card.label}>
            <img src={card.icon} className="w-8 h-8" alt="" />
            <p className="text-gray-900 font-semibold text-lg mt-1">
              {loading ? "--" : `${Math.round(card.value)}${card.suffix}`}
            </p>
            <p className="text-gray-500 text-sm -mt-1">{card.label.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {/* BUTTON */}
      <div className="mt-12 px-3">
        <Link to="/nutrition-dashboard">
        <button
          className="
            w-full bg-blue-600 text-white py-3 rounded-2xl text-lg
            flex justify-center items-center gap-2
          "
        >
          Great, thanks!
          <span className="text-xl"><img src="arr-white.png" alt="" /></span>
        </button>
        </Link>
      </div>

    </div>
  );
}
