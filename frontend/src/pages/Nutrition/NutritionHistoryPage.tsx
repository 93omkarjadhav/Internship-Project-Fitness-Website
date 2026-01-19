import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchNutritionHistory, MealData } from "../lib/api";

const isBeforeNow = (dateStr: string, timeStr?: string) => {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  if (timeStr) {
    const [h = 0, m = 0, s = 0] = timeStr.split(':').map(Number);
    date.setHours(h || 0, m || 0, s || 0, 0);
  }
  return date.getTime() <= Date.now();
};

const NutritionHistoryPage: React.FC = () => {
  const [nutritionHistory, setNutritionHistory] = useState<MealData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest"); // Default to newest
  const [selectedDate, setSelectedDate] = useState<string>(""); // New state for selected date
  const [filterByNutrition, setFilterByNutrition] = useState<string>("All Nutritions");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchNutritionHistory();
        if (active) {
          setNutritionHistory(data);
          setError(null);
        }
      } catch {
        if (active) {
          setError("Unable to load history right now. Showing demo data.");
          setNutritionHistory([
            {
              id: 1,
              meal_name: "Morning Oatmeal",
              meal_type: "Breakfast",
              calories: 285,
              protein: 12.8,
              fat: 2.3,
              carbs: 8.8,
              meal_date: "2025-06-23T00:00:00.000Z",
              meal_time: "08:00:00",
            },
            {
              id: 2,
              meal_name: "Lunch Salad",
              meal_type: "Lunch",
              calories: 420,
              protein: 22,
              fat: 10,
              carbs: 35,
              meal_date: "2025-06-23T00:00:00.000Z",
              meal_time: "13:00:00",
            },
            {
              id: 3,
              meal_name: "Dinner Chicken",
              meal_type: "Dinner",
              calories: 550,
              protein: 40,
              fat: 15,
              carbs: 20,
              meal_date: "2025-06-22T00:00:00.000Z",
              meal_time: "19:00:00",
            },
          ]);
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

  const historyUntilNow = nutritionHistory.filter((meal) => isBeforeNow(meal.meal_date, meal.meal_time));

  const uniqueNutritionTypes = ["All Nutritions", ...new Set(historyUntilNow.map(meal => meal.meal_name))];

  const filteredAndSortedHistory = historyUntilNow
    .filter((meal) => {
      const matchesSearch = meal.meal_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterByNutrition === "All Nutritions" || meal.meal_name === filterByNutrition;
      const matchesDate = !selectedDate || new Date(meal.meal_date).toDateString() === new Date(selectedDate).toDateString();
      return matchesSearch && matchesFilter && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.meal_date).getTime() - new Date(a.meal_date).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.meal_date).getTime() - new Date(b.meal_date).getTime();
      }
      return 0;
    });

  const formatFullDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
      return d.toLocaleDateString(undefined, opts);
    } catch {
      return iso;
    }
  };

  const groupedHistory = filteredAndSortedHistory.reduce<Record<string, MealData[]>>((acc, meal) => {
    const date = new Date(meal.meal_date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meal);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b).getTime() - new Date(a).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a).getTime() - new Date(b).getTime();
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-100 pt-8 px-4 md:p-8">
      <div className="flex items-center gap-3 mb-4 md:mb-6 pt-2 md:pt-0">
        <Link
          to="/nutrition-dashboard"
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
          aria-label="Go back"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Nutrition History</h2>
          <p className="text-gray-600 text-sm">Understand your nutrition patterns and improve your health.</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-row justify-between items-center mb-4 gap-3 md:flex-row">
          <h3 className="font-bold text-gray-700 text-sm mb-2 md:mb-0">All Nutritions</h3>

          <div className="flex">
            <div className="relative mr-2">
              <button
                onClick={() => {
                  const datePicker = document.getElementById("datePicker") as HTMLInputElement;
                  if (datePicker && typeof datePicker.showPicker === 'function') {
                    datePicker.showPicker();
                  }
                }}
                className="flex items-center gap-2 bg-transparent text-gray-700 text-sm font-medium"
              >
                <img
                  src="/public/calender.png"
                  alt="Calendar"
                  className="w-4 h-4 object-contain"
                />

                <span className="text-[14px] font-semibold">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString("en-GB")
                    : "Sort By: Date"}
                </span>

                <img
                  src="/public/down-arr.png"
                  alt="Dropdown"
                  className="w-3 h-3 object-contain"
                />
              </button>

              {/* Hidden date input */}
              <input
                id="datePicker"
                type="date"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>


            {/* <div className="relative ml-2">
              <select
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div> */}
          </div>
        </div>

        <div className="mb-4 relative flex items-center">
          <img src="/public/search.png" alt="Search" className="w-5 h-5 object-contain absolute left-3" />
          <input
            type="text"
            placeholder="Search nutrition..."
            className="w-full p-2 pl-10 pr-10 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link to="/filter-nutrition" className="absolute right-3">
          <img src="filter.png" width={20} height={20}     className="transition duration-200 group-hover:brightness-0 group-hover:hue-rotate-180 group-hover:contrast-150"
          />
          </Link>
          {/* <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 absolute right-3"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> */}
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-600 text-sm">Loading nutrition history...</p>
          ) : sortedDates.length > 0 ? (
            sortedDates.map((date) => (
              <div key={date}>
                <h3 className="text-gray-800 font-semibold text-lg mb-2 mt-4">{formatFullDate(date)}</h3>
                {groupedHistory[date].map((meal, index) => (
                  <Link
                  to={`/meal-details?id=${meal.id}`}
                  key={index}
                  className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4 mb-3 cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <img src="/apple-1.png" alt="meal" className="w-5 h-5 object-contain" />
                  </div>
                
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-800 text-base font-bold">{meal.calories}kcal</p>
                        <p className="text-gray-600 text-sm mt-1">{meal.meal_name}</p>
                      </div>
                
                      <div className="text-right flex items-center gap-2">
                        <img src="/arrow.png" alt="arrow" className="w-4 h-4 opacity-70" />
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
                
                ))}
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-sm">
              {error ?? "No nutrition history found."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NutritionHistoryPage;
