import React, { useEffect, useState } from "react";
import { IoChevronBack, IoAdd } from 'react-icons/io5';
import { fetchProfile, ProfileSummary } from "../lib/api";
import { Link } from "react-router-dom";

export default function NutritionGoalPage() {
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchProfile()
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch(() => {
        if (active) setError("Unable to load your goal.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full flex mt-5  rounded-2xl justify-center">
      <div className="hidden md:block shadow-lg w-full max-w-xl bg-white rounded-3xl h-[750px]  p-4 ">
        <NutritionContent profile={profile} loading={loading} error={error} />
      </div>
      <div className="md:hidden w-full p-6">
        <NutritionContent profile={profile} loading={loading} error={error} />
      </div>
    </div>
  );
}

function NutritionContent({ profile, loading, error }: { profile: ProfileSummary | null; loading: boolean; error: string | null }) {
  const macroCards = [
    { label: "Carb", value: profile?.carb_target ?? 0, unit: "g", icon: "/icons/fire red.png", progress: 0.6, color: "bg-red-500" },
    { label: "Fat", value: profile?.fat_target ?? 0, unit: "g", icon: "/icons/drop purple.png", progress: 0.5, color: "bg-purple-500" },
    { label: "Protein", value: profile?.protein_target ?? 0, unit: "g", icon: "/icons/bone.png", progress: 0.4, color: "bg-blue-500" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-0 md:p-1">
      <div className=" md:rounded-2xl -mt-20 p-0  w-full md:max-w-4xl flex flex-col">
      {/* TOP BAR */}
      <div className="-mt-20 flex justify-between items-center mb-20">
        <Link
          to="/nutrition-dashboard"
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
          aria-label="Go back"
        >
          <IoChevronBack className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="font-semibold text-gray-900 text-lg">Nutrition Goal</h1>
        <img src="/bell.png" alt="" className="w-6 h-6" />
      </div>

      {/* CALORIES BIG NUMBER */}
      <div className="text-center mt-4">
        <h2 className="text-5xl font-bold  text-gray-900">{loading ? "--" : profile?.calorie_target ?? "--"}</h2>
        <p className="text-gray-700 text-lg font-semibold mt-4">total kcal daily</p>
        <p className="text-gray-500 text-sm mt-1">
          {error ?? "You've done 3 exercises this week."}
        </p>
      </div>

      {/* MACRO BOXES */}
      <div className="flex justify-between mt-20 px-3">
        {macroCards.map((card) => (
          <div className="flex flex-col items-center" key={card.label}>
            <img
              src={card.icon}
              className="w-8 h-8"
              alt=""
            />
            <p className="text-gray-900 font-semibold text-lg mt-1">
              {loading ? "--" : card.value}{card.unit === "g" ? "g" : ""}
            </p>
            <p className="text-gray-500 text-sm -mt-1">{card.label.toLowerCase()}</p>

            <div className="w-20 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div className={`h-1 ${card.color}`} style={{ width: `${card.progress * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* BUTTON */}
      <div className="mt-16 px-4">
        <Link to="/edit-goal">
        <button className="
          w-full bg-blue-600 text-white py-3 rounded-2xl mb-4
          font-medium flex justify-center items-center gap-2 text-lg
        ">
          Edit Goal
          <img src="/icons/edit pencil2.png" className="w-5 h-5" />
        </button>
        </Link>
      </div>
    </div>
    </div>
  );
}
