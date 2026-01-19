import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNutritionProfile } from "../../context/NutritionProfileContext";
import { FaArrowRight } from "react-icons/fa";

const CalorieIntake = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useNutritionProfile();

  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [calories, setCalories] = useState(profile.calorie_intake || 2000);

  const [weight, setWeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInch, setHeightInch] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState("light");
  const [goal, setGoal] = useState("maintain");

  const [isSmallLogo, setIsSmallLogo] = useState(false);

  const handleScroll = (e: any) => {
    setIsSmallLogo(e.target.scrollTop > 20);
  };

  useEffect(() => {
    updateProfile({ calorie_intake: calories });
  }, [calories]);

  const increaseCalories = () => setCalories(prev => prev + 100);
  const decreaseCalories = () => setCalories(prev => (prev > 100 ? prev - 100 : prev));

  const calculateCalories = () => {
    const w = Number(weight);
    const h = Number(heightFeet) * 30.48 + Number(heightInch) * 2.54;
    const a = Number(age);
    if (!w || !h || !a) return;

    let bmr =
      gender === "male"
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161;

    const activityMultiplier: any = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };

    let tdee = bmr * activityMultiplier[activity];
    if (goal === "lose") tdee *= 0.8;
    if (goal === "gain") tdee *= 1.15;

    setCalories(Math.round(tdee));
  };

  return (
<div
  className={`
    w-screen min-h-screen bg-[#f4f6f8] px-4 
    flex justify-center 
    ${mode === "manual" ? "items-start pt-16" : "items-center py-10"}
  `}
>

      {/* CARD */}
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg h-[90vh] flex flex-col overflow-hidden relative">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/nutrition/snack-frequency")}
          className="absolute top-4 left-4 p-2 hover:opacity-70 transition z-30"
          aria-label="Go back"
        >
          <img src="/chevron left (2).png" alt="Back" className="w-5 h-5" style={{ filter: 'brightness(0)' }} />
        </button>

        {/* HEADER WITH SHRINKING LOGO */}
        <div
          className={`sticky top-0 z-20 flex justify-center bg-white 
          transition-all duration-300 
          ${isSmallLogo ? "py-1 scale-75 shadow-sm" : "py-4 scale-100"}
        `}
        >
          <img src="/logo.png" className="w-20 transition-all duration-300" />
        </div>

        {/* SCROLL AREA */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-8 pb-10 pt-4"
        >
          <h2 className="text-2xl text-center font-semibold mt-2 mb-4">
            What's your daily calorie intake?
          </h2>

          <p className="text-gray-600 text-center mb-8 text-sm">
            Choose manual entry or let us calculate it for you.
          </p>

          {/* MODE SWITCH */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setMode("manual")}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
                mode === "manual"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Enter Manually
            </button>

            <button
              onClick={() => setMode("auto")}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
                mode === "auto"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Calculate Automatically
            </button>
          </div>

          {/* ALL INPUTS (manual + auto modes) */}
          {mode === "manual" ? (
            <>
              <p className="text-gray-600 text-sm text-center mb-4">Daily Intake (kcal)</p>

              <div className="flex items-center justify-center gap-4 mb-5">
                <button
                  className="w-10 h-10 bg-gray-200 rounded-full text-lg"
                  onClick={decreaseCalories}
                >
                  −
                </button>

                <input
                  type="text"
                  value={calories}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setCalories(val ? Number(val) : 0);
                  }}
                  className="w-28 text-center border border-gray-300 rounded-xl p-3 text-xl"
                />

                <button
                  className="w-10 h-10 bg-gray-200 rounded-full text-lg"
                  onClick={increaseCalories}
                >
                  +
                </button>
              </div>

              <p className="text-center text-gray-600 mb-8">
                I consume around <strong>{calories} kcal</strong> daily.
              </p>
            </>
          ) : (
            <>
              {/* Weight */}
              <label className="font-medium text-sm">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full mt-1 p-3 mb-3 border rounded-xl"
              />

              {/* Height */}
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="font-medium text-sm">Height (ft)</label>
                  <input
                    type="number"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className="w-full mt-1 p-3 border rounded-xl"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-medium text-sm">Height (in)</label>
                  <input
                    type="number"
                    value={heightInch}
                    onChange={(e) => setHeightInch(e.target.value)}
                    className="w-full mt-1 p-3 border rounded-xl"
                  />
                </div>
              </div>

              {/* Age */}
              <label className="font-medium text-sm">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full mt-1 p-3 mb-3 border rounded-xl"
              />

              {/* Gender */}
              <label className="font-medium text-sm">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full mt-1 p-3 mb-3 border rounded-xl"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              {/* Activity */}
              <label className="font-medium text-sm">Activity Level</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full mt-1 p-3 mb-3 border rounded-xl"
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
              </select>

              {/* Goal */}
              <label className="font-medium text-sm">Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full mt-1 p-3 mb-5 border rounded-xl"
              >
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Weight</option>
              </select>

              {/* CALCULATE Button */}
              <button
                onClick={calculateCalories}
                className="w-full py-3 bg-blue-600 text-white rounded-xl shadow mb-5"
              >
                Calculate My Calories
              </button>

              <p className="text-center text-gray-700 font-medium">
                Estimated need: <strong>{calories} kcal</strong>
              </p>
            </>
          )}

          {/* Continue BTN */}
          <button
            onClick={() => navigate("/nutrition/food-allergies")}
            className="mt-8 w-full py-4 bg-blue-600 text-white rounded-xl shadow-lg flex justify-center items-center gap-2 text-lg font-semibold"
          >
            Continue <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalorieIntake;
