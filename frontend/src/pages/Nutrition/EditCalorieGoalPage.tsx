import React, { useEffect, useState } from "react";
import { IoChevronBack } from 'react-icons/io5';
import { fetchProfile, updateProfile } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"; // ✅ import toast

export default function EditCalorieGoalPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center">
      <div className="hidden md:block w-full max-w-xl bg-white rounded-3xl shadow-lg p-8 mt-10">
        <EditGoalContent />
      </div>
      <div className="md:hidden w-full p-6">
        <EditGoalContent />
      </div>
    </div>
  );
}

function EditGoalContent() {
  const navigate = useNavigate();

  const [protein, setProtein] = useState(180);
  const [dailyMeal, setDailyMeal] = useState(5);
  const [dailyCarb, setDailyCarb] = useState(200);
  const [dailyCalorie, setDailyCalorie] = useState(2000);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchProfile()
      .then((profile) => {
        if (!active) return;
        setDailyMeal(profile.meals_per_day ?? 5);
        setDailyCarb(profile.carb_target ?? 200);
        setDailyCalorie(profile.calorie_target ?? 2000);
        setProtein(profile.protein_target ?? 180);
      })
      .catch(() => {
        if (active) setError("Unable to load current goal.");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleUpdate = async () => {
    setStatus('saving');
    setError(null);

    try {
      await updateProfile({
        meals_per_day: dailyMeal,
        carb_target: dailyCarb,
        calorie_target: dailyCalorie,
        protein_target: protein,
      });

      setStatus('success');

      // ✅ Toast popup
      toast.success("Updated successfully!");

      // Redirect after 1 sec
      setTimeout(() => navigate('/nutrition-goal'), 1500);

    } catch {
      setError("Failed to update your goal. Please try again.");
      setStatus('error');

      toast.error("Update failed");
    }
  };

  return (
    <div className="w-full">
      <Link
        to="/nutrition-goal"
        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition inline-flex mb-4"
        aria-label="Go back"
      >
        <IoChevronBack className="w-6 h-6 text-gray-800" />
      </Link>

      <h1 className="text-3xl font-bold text-gray-900">Edit Calorie Goal</h1>
      <p className="text-gray-500 mt-1">
        Here you can edit your activity goal with ease.
      </p>

      {/* DAILY MEAL */}
      <div className="mt-8">
        <label className="text-gray-800 font-semibold text-sm">Daily Meal</label>
        <div className="relative mt-2">
          <img
            src="/icons/calendar.png"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2"
            alt=""
          />
          <input
            className="w-full bg-white border border-gray-300 rounded-2xl pl-12 pr-10 py-3 text-gray-700"
            type="number"
            min={1}
            value={dailyMeal}
            onChange={(e) => setDailyMeal(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* DAILY CARB */}
      <div className="mt-6">
        <label className="text-gray-800 font-semibold text-sm">Daily Carb</label>
        <div className="relative mt-2">
          <img
            src="/icons/wheat.png"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2"
            alt=""
          />
          <input
            className="w-full bg-white border border-gray-300 rounded-2xl pl-12 pr-10 py-3 text-gray-700"
            type="number"
            value={dailyCarb}
            onChange={(e) => setDailyCarb(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* DAILY CALORIE */}
      <div className="mt-6">
        <label className="text-gray-800 font-semibold text-sm">Daily Calorie</label>
        <div className="relative mt-2">
          <img
            src="/icons/fire.png"
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2"
            alt=""
          />
          <input
            className="w-full bg-white border border-gray-300 rounded-2xl pl-12 pr-10 py-3 text-gray-700"
            type="number"
            value={dailyCalorie}
            onChange={(e) => setDailyCalorie(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* PROTEIN */}
      <div className="mt-6">
        <label className="text-gray-800 font-semibold text-sm">Daily Protein</label>
        <input
          type="range"
          min="0"
          max="300"
          value={protein}
          onChange={(e) => setProtein(Number(e.target.value))}
          className="w-full mt-4 accent-blue-600"
        />
        <div className="flex justify-between mt-1">
          <span className="text-gray-800 font-semibold">{protein}</span>
          <span className="text-gray-600">g</span>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-sm text-red-500 mt-4">{error}</p>
      )}

      {/* UPDATE BUTTON */}
      <div className="mt-10">
        <button
          onClick={handleUpdate}
          disabled={status === 'saving'}
          className="w-full bg-blue-600 text-white py-3 rounded-2xl text-lg flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {status === 'saving' ? 'Updating...' : 'Update Goal'}
          <img src="/icons/check.png" alt="" className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
