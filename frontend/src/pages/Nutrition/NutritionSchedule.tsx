// src/pages/NutritionSchedule.tsx

import { ChevronLeft, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import bellIcon from "/icons/bell-icon.png";
import homeIcon from "/icons/home simple.png";
import foodIcon from "/icons/bread toast.png";
import editIcon from "/icons/edit pencil.png";
import { fetchNutritionHistory, MealData } from "../lib/api";
import AddMealPage from "./AddMealPage";

// EMPTY UI
import { IoAdd } from "react-icons/io5";
import emptyScheduleIllustration from "../assets/empty-schedule.png";

// DELETE POPUP
import DeleteMealPopup from "./DeleteMealPopup";
import { Link } from "react-router-dom";

const formatSlotLabel = (time: string) => time;
const formatMacro = (v: number, s: string) => `${Math.round(v)}${s}`;

const formatLocalDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const buildDays = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const days = [];

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = new Date(currentYear, currentMonth, day);
    days.push({
      iso: formatLocalDate(d),
      label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1),
      dayNumber: day,
    });
  }

  for (let day = 1; day <= 7; day++) {
    const d = new Date(currentYear, currentMonth + 1, day);
    days.push({
      iso: formatLocalDate(d),
      label: d.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1),
      dayNumber: day,
    });
  }

  return days;
};


export default function NutritionSchedule({ onClose }: { onClose: () => void }) {

  const todayIso = formatLocalDate(new Date());
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedMealId, setSelectedMealId] = useState<number | null>(null);

  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // DELETE POPUP STATE
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteMealId, setDeleteMealId] = useState<number | null>(null);
  const [showAddMeal, setShowAddMeal] = useState(false);

  const weekDays = useMemo(() => buildDays(), []);

  const refreshMeals = async () => {
    try {
      const data = await fetchNutritionHistory();
      setMeals(data);
    } catch (err) { }
  };

 

  useEffect(() => {
    fetchNutritionHistory()
      .then((data) => {
        setMeals(data);
        setError(null);
      })
      .catch(() => setError("Unable to load schedule right now."))
      .finally(() => setLoading(false));
  }, []);

  const upcomingSchedule = useMemo(() => {
    const now = new Date();

    return meals
      .filter((meal) => {
        if (!meal.meal_date) return false;

        let ds = meal.meal_date.includes("T")
          ? meal.meal_date.split("T")[0]
          : meal.meal_date;

        const [y, m, d] = ds.split("-").map(Number);
        const md = new Date(y, m - 1, d);

        if (meal.meal_time) {
          const [hh, mm, ss] = meal.meal_time.split(":").map(Number);
          md.setHours(hh, mm, ss || 0, 0);
        }

        return md.getTime() > now.getTime();
      })
      .map((meal) => {
        let normalized = meal.meal_date.includes("T")
          ? meal.meal_date.split("T")[0]
          : meal.meal_date;

        return {
          id: meal.id,
          meal_name: meal.meal_name,
          meal_type: meal.meal_type,
          scheduled_time: meal.meal_time || "12:00:00",
          scheduled_date: normalized,
          calories: meal.calories,
          protein: meal.protein,
          fat: meal.fat,
          carbs: meal.carbs,
          status: "scheduled" as const,
        };
      });
  }, [meals]);

  const dayMeals = useMemo(
    () => upcomingSchedule.filter((m) => m.scheduled_date === selectedDate),
    [upcomingSchedule, selectedDate]
  );

  const slotKeys = useMemo(() => {
    const base = [
      "06:00",
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
      "20:00",
      "22:00",
    ];
    const slots = new Set(base);

    dayMeals.forEach((meal) => {
      const [h, m] = meal.scheduled_time.split(":");
      slots.add(`${h}:${m}`);
    });

    return Array.from(slots).sort();
  }, [dayMeals]);

  const mealsBySlot = useMemo(() => {
    return slotKeys.reduce((acc, slot) => {
      acc[slot] = dayMeals.filter(
        (m) => m.scheduled_time.slice(0, 5) === slot
      );
      return acc;
    }, {} as Record<string, typeof upcomingSchedule>);
  }, [slotKeys, dayMeals]);

  return (
    <>
      {/* 🔥 DELETE POPUP */}
      {showDeletePopup && deleteMealId !== null && (
        <DeleteMealPopup
          mealId={deleteMealId}
          type="history"
          onClose={() => setShowDeletePopup(false)}
          onDeleted={() => {
            refreshMeals();
            setSelectedMealId(null);
          }}
        />
      )}

      <div className="min-h-screen w-full flex flex-col items-center justify-center p-0 md:p-4">
        <div className="bg-gray-50 w-full h-full flex flex-col">

          {/* HEADER */}
          <header className="sticky top-0 z-10 bg-white px-4 pt-4 -mt-20 pb-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setShowAddMeal(false); // 🔥 FORCE reset child drawer
                  onClose();             // close schedule
                }}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
              >

                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>

              <h1 className="text-lg font-semibold text-gray-900">
                Nutrition Schedule
              </h1>
              <button className="p-2 -mr-2">
                <img src={bellIcon} className="w-6 h-6" />
              </button>
            </div>
          </header>

          {/* WEEK DAYS */}
          <div className="sticky top-[70px] z-10 bg-white px-4 pb-3">
            <div className="flex gap-3 overflow-x-auto">
              {weekDays.map((day) => (
                <button
                  key={day.iso}
                  onClick={() => setSelectedDate(day.iso)}
                  className={`flex flex-col items-center justify-center rounded-full border w-11 h-14 flex-shrink-0 ${selectedDate === day.iso
                    ? "bg-blue-50 border-blue-500"
                    : "border-gray-300 text-gray-900"
                    }`}
                >
                  <span className="text-xs">{day.label}</span>
                  <span className="text-sm font-semibold">
                    {day.dayNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TIMELINE GRID */}
          <div className="grid grid-cols-[65px_1fr] px-4 pb-16">
            {loading ? (
              <div className="col-span-2 text-center py-10">
                Loading schedule...
              </div>
            ) : error ? (
              <div className="col-span-2 text-center text-red-500 py-10">
                {error}
              </div>
            ) : dayMeals.length === 0 ? (
              <div className="col-span-2 flex  flex-col items-center text-center px-8 pt-12 pb-16">
                <img
                  src={emptyScheduleIllustration}
                  className="w-full max-w-[260px] mb-6"
                />
                {/* <Link to="/add-meal-manually" className="w-full max-w-[200px] h-[48px] flex items-center justify-center gap-2 bg-blue-600 text-white text-[16px] font-semibold rounded-[14px] shadow mb-6">
                  <button className="flex gap-2">
                    Add Meal <IoAdd className="w-5 mt-0.5 h-5" />
                  </button>
                </Link> */}
                <button
                  onClick={() => setShowAddMeal(true)}
                  className="w-full max-w-[200px] h-[48px] flex items-center justify-center gap-2 bg-blue-600 text-white text-[16px] font-semibold rounded-[14px] shadow mb-6"
                >
                  Add Meal <IoAdd className="w-5 mt-0.5 h-5" />
                </button>


                <h2 className="text-lg font-semibold text-gray-900">
                  You haven't eaten anything today.
                </h2>

                <p className="text-gray-600 text-sm mt-2 max-w-[260px]">
                  Let's log your first meal today and get insights.
                </p>
              </div>
            ) : (
              slotKeys.map((time) => (
                <div key={time} className="contents">
                  {/* TIME LABEL */}
                  <div className="relative h-24 flex items-center">
                    <div className="absolute h-7 bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full shadow-sm">
                      {formatSlotLabel(time)}
                    </div>
                    <div className="w-px h-full bg-gray-300 mx-auto" />
                  </div>

                  {/* MEALS */}
                  <div className="flex flex-col gap-4 pt-6">
                    {mealsBySlot[time]?.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        selected={selectedMealId === meal.id}
                        onSelect={() =>
                          setSelectedMealId(
                            selectedMealId === meal.id ? null : meal.id
                          )
                        }
                        onDelete={() => {
                          setDeleteMealId(meal.id);
                          setShowDeletePopup(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FLOAT BUTTON */}
          {/* <Link to="/add-meal-manually">
            <button className="fixed bottom-10 right-20 w-12 h-12 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </button>
          </Link> */}
          <button
            onClick={() => setShowAddMeal(true)}
            className="fixed bottom-10 right-20 w-12 h-12 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </button>

        </div>
      </div>

      
      {/* ================= ADD MEAL DRAWER ================= */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${showAddMeal ? "pointer-events-auto" : "pointer-events-none"
          }`}
      >
        {/* BACKDROP */}
        <div
          onClick={() => setShowAddMeal(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${showAddMeal ? "opacity-100" : "opacity-0"
            }`}
        />

        {/* DRAWER */}
        <div
          className={`
      absolute top-0 right-0 h-full
      w-full md:w-[90%]
      bg-white shadow-2xl
      rounded-l-3xl
      transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
      ${showAddMeal ? "translate-x-0" : "translate-x-full"}
    `}
        >
          <AddMealPage onClose={() => setShowAddMeal(false)} />
        </div>
      </div>

    </>
  );
}

/* ---------------- MEAL CARD ---------------- */
const MealCard = ({
  meal,
  selected,
  onSelect,
  onDelete,
}: {
  meal: {
    id: number;
    meal_name: string;
    meal_type: string;
    scheduled_time: string;
    scheduled_date: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    status: string;
  };
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-all duration-300 ease-out w-full
        lg:w-[78%] lg:ml-6
        ${selected
          ? "bg-white border border-blue-500 shadow-2xl -translate-x-5"
          : "bg-white border border-transparent shadow-md"
        }`}
    >
      {/* ICON */}
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <img
          src={meal.meal_type === "Home" ? homeIcon : foodIcon}
          className="w-5 h-5"
        />
      </div>

      {/* NAME + MACROS */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900">
          {meal.meal_name}
        </p>

        <div className="flex gap-4 text-xs text-gray-500 mt-1">
          <div className="flex gap-0.5">
            <img src="/icons/fire.png" className="w-4 h-4" alt="fire" />
            <span>{meal.calories}k</span>
          </div>
          <span>{formatMacro(meal.protein, "p")}</span>
          <span>{formatMacro(meal.fat, "f")}</span>
          <span>{formatMacro(meal.carbs, "c")}</span>
        </div>
      </div>

      <button className="p-2">
        <img src={editIcon} />
      </button>

      {selected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <img
            src="/icons/delete.png"
            className="absolute right-[-33px] top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-full shadow-lg bg-red-500"
          />
        </button>
      )}
    </div>
  );
};
