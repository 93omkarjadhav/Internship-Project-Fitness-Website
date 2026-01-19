// src/pages/MealDetails.tsx
import { useEffect, useMemo, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PieChart, Pie, Cell } from "recharts";
import { fetchMealById, fetchNutritionHistory, MealData } from "../lib/api";

const COLORS = ["#2563EB", "#F59E0B", "#10B981"];

// ---------- helpers ----------
const formatDate = (iso?: string) => {
  if (!iso) return "Today";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const formatTime = (time?: string) => {
  if (!time) return "--";
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = ((hour + 11) % 12) + 1;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
};

// Map OFF nutrient keys -> pretty labels
const MICRO_MAP: Record<
  string,
  { label: string; unit: string; key: string }
> = {
  fiber_100g: { label: "Fiber", unit: "g", key: "fiber_100g" },
  sugars_100g: { label: "Sugar", unit: "g", key: "sugars_100g" },
  sodium_100g: { label: "Sodium", unit: "g", key: "sodium_100g" }, // OFF gives grams
  iron_100g: { label: "Iron", unit: "mg", key: "iron_100g" }, // often in mg/100g (but OFF normalizes; we keep value*1000 if <1)
  calcium_100g: { label: "Calcium", unit: "mg", key: "calcium_100g" },
  "vitamin-c_100g": { label: "Vitamin C", unit: "mg", key: "vitamin-c_100g" },
  "vitamin-b12_100g": {
    label: "Vitamin B12",
    unit: "µg",
    key: "vitamin-b12_100g",
  },
};

// Try to choose a good OFF product
function pickProduct(products: any[]) {
  if (!Array.isArray(products)) return null;
  // prefer one that actually has calories per 100g
  return (
    products.find((p) => p?.nutriments?.["energy-kcal_100g"]) || products[0]
  );
}

export default function MealDetails() {
  const [searchParams] = useSearchParams();
  const { id: idParam } = useParams();
  const [meal, setMeal] = useState<MealData | null>(null);

  // dynamic nutrition fetched from API (per serving inferred)
  const [dynMacros, setDynMacros] = useState<{
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    servingGrams: number | null;
    micros: { label: string; value: number; unit: string }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- load meal from backend (DB) ----
  useEffect(() => {
    let active = true;
    const fromPath = idParam ? Number(idParam) : NaN;
    const mealId = Number.isFinite(fromPath)
      ? fromPath
      : Number(searchParams.get("id"));

    const load = async () => {
      try {
        if (Number.isFinite(mealId)) {
          const result = await fetchMealById(mealId);
          if (active) setMeal(result);
        } else {
          const history = await fetchNutritionHistory({
            limit: 1,
            sort: "newest",
          });
          if (active) setMeal(history[0] ?? null);
        }
      } catch {
        if (active) setError("Unable to load meal details right now.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [searchParams, idParam]);

  // ---- fetch dynamic nutrition from OpenFoodFacts using meal_name ----
  useEffect(() => {
    if (!meal?.meal_name) return;

    let cancelled = false;
    (async () => {
      try {
        setLoadingNutrition(true);
        // 1) Search by name
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          meal.meal_name
        )}&search_simple=1&action=process&json=1`;
        const res = await fetch(url);
        const data = await res.json();
        const product = pickProduct(data?.products || []);
        const nutr = product?.nutriments || {};

        const kcalPer100 = Number(nutr["energy-kcal_100g"] || 0);
        if (!kcalPer100 || meal.calories <= 0) {
          if (!cancelled) {
            setDynMacros(null);
            setLoadingNutrition(false);
          }
          return;
        }

        // 2) infer serving grams from saved calories (Option C)
        // grams ~= (savedCalories / caloriesPer100g) * 100
        let servingGrams = (meal.calories / kcalPer100) * 100;
        // guardrails
        if (!isFinite(servingGrams) || servingGrams <= 0) servingGrams = 100;
        servingGrams = Math.max(20, Math.min(servingGrams, 1200)); // 20g..1200g

        const mult = servingGrams / 100;

        // 3) compute macros using OFF per-100g values
        const p = Math.max(0, Number(nutr["proteins_100g"] || 0) * mult);
        const f = Math.max(0, Number(nutr["fat_100g"] || 0) * mult);
        const c = Math.max(0, Number(nutr["carbohydrates_100g"] || 0) * mult);
        const k = Math.round(kcalPer100 * mult);

        // 4) micros we can show if present
        const micros: { label: string; value: number; unit: string }[] = [];
        Object.values(MICRO_MAP).forEach(({ key, label, unit }) => {
          const raw = nutr[key];
          if (raw === undefined || raw === null) return;
          let val = Number(raw) * mult;

          // make mg/µg look right if values are small (heuristic)
          // OFF usually normalizes to grams; we display common units:
          if (unit === "mg") {
            val = Math.round(val * 1000); // g -> mg
          } else if (unit === "µg") {
            val = Math.round(val * 1_000_000); // g -> µg
          } else {
            val = Math.round(val * 10) / 10; // keep 1 decimal for grams
          }

          micros.push({ label, value: val, unit });
        });

        if (!cancelled) {
          setDynMacros({
            calories: k,
            protein: Math.round(p),
            fat: Math.round(f),
            carbs: Math.round(c),
            servingGrams,
            micros,
          });
        }
      } catch (e) {
        if (!cancelled) setDynMacros(null);
      } finally {
        if (!cancelled) setLoadingNutrition(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [meal?.meal_name, meal?.calories]);

  // ---- choose data for chart/metrics: dynamic if available, else DB ----
  const chartData = useMemo(() => {
    const P = dynMacros?.protein ?? meal?.protein ?? 0;
    const F = dynMacros?.fat ?? meal?.fat ?? 0;
    const C = dynMacros?.carbs ?? meal?.carbs ?? 0;
    return [
      { name: "Protein", value: P },
      { name: "Fat", value: F },
      { name: "Carbs", value: C },
    ];
  }, [dynMacros, meal]);

  const caloriesToShow = dynMacros?.calories ?? meal?.calories ?? 0;

  return (
    <div className="w-full min-h-screen bg-gray-50 flex justify-center">
      {/* DESKTOP VIEW */}
      <div className="hidden md:block w-full max-w-4xl bg-white rounded-3xl shadow-lg p-8 mt-10">
        <MealDetailsContent
          meal={meal}
          loading={loading}
          loadingNutrition={loadingNutrition}
          error={error}
          chartData={chartData}
          caloriesToShow={caloriesToShow}
          dynMacros={dynMacros}
        />
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden w-full p-4">
        <MealDetailsContent
          meal={meal}
          loading={loading}
          loadingNutrition={loadingNutrition}
          error={error}
          chartData={chartData}
          caloriesToShow={caloriesToShow}
          dynMacros={dynMacros}
        />
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   CONTENT COMPONENT (used for both mobile + desktop)
------------------------------------------------------------ */

function MealDetailsContent({
  meal,
  loading,
  loadingNutrition,
  error,
  chartData,
  caloriesToShow,
  dynMacros,
}: {
  meal: MealData | null;
  loading: boolean;
  loadingNutrition: boolean;
  error: string | null;
  chartData: { name: string; value: number }[];
  caloriesToShow: number;
  dynMacros: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    servingGrams: number | null;
    micros: { label: string; value: number; unit: string }[];
  } | null;
}) {
  if (loading) {
    return (
      <p className="text-center text-gray-500 py-16">Loading meal details...</p>
    );
  }

  if (!meal) {
    return (
      <p className="text-center text-gray-500 py-16">
        {error || "Meal not found."}
      </p>
    );
  }

  return (
    <>
      <PageHeader />

      {/* Responsive layout */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-6 lg:p-4">
        {/* right col  */}
        <div className="flex flex-col">
          <MacroBreakdown
            calories={caloriesToShow}
            chartData={chartData}
            loadingNutrition={loadingNutrition}
            servingGrams={dynMacros?.servingGrams ?? null}
            micros={dynMacros?.micros ?? []}
          />
        </div>
        {/* <div className="flex flex-col">
          <MealCard mealName={meal.meal_name} calories={caloriesToShow} date={meal.meal_date} time={meal.meal_time} />
          <KeyMetrics
            mealName={meal.meal_name}
            calories={caloriesToShow}
            fat={dynMacros?.fat ?? meal.fat}
            carbs={dynMacros?.carbs ?? meal.carbs}
            protein={dynMacros?.protein ?? meal.protein}
          />
        </div> */}
        {/* left righht  */}
        <div className="flex flex-col">
          <MealCard mealName={meal.meal_name} calories={caloriesToShow} date={meal.meal_date} time={meal.meal_time} />
          <KeyMetrics
            mealName={meal.meal_name}
            calories={caloriesToShow}
            fat={dynMacros?.fat ?? meal.fat}
            carbs={dynMacros?.carbs ?? meal.carbs}
            protein={dynMacros?.protein ?? meal.protein}
          />
        </div> 
        {/* <div className="flex flex-col">
          <MacroBreakdown
            calories={caloriesToShow}
            chartData={chartData}
            loadingNutrition={loadingNutrition}
            servingGrams={dynMacros?.servingGrams ?? null}
            micros={dynMacros?.micros ?? []}
          />
        </div> */}
      </div>

      <FooterButtons />
    </>
  );
}

/* -----------------------------------------------------------
   Page Header
------------------------------------------------------------ */

function PageHeader() {
  return (
    <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between">
      <Link
        to="/nutrition-dashboard"
        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
        aria-label="Go back"
      >
        <IoChevronBack className="w-6 h-6 text-gray-800" />
      </Link>
      <span className="text-lg font-medium">Meal Details</span>
      <img src="/icons/bell-icon.png" className="w-7 h-7" alt="" />
    </div>
  );
}

/* -----------------------------------------------------------
   Meal Header Card
------------------------------------------------------------ */

function MealCard({
  mealName,
  calories,
  date,
  time,
}: {
  mealName: string;
  calories: number;
  date?: string;
  time?: string;
}) {
  return (
    <div className="flex flex-col items-center p-8 text-gray-800">
      <img src="/fork knife.png" className="mb-3" />
      <div className="text-3xl font-bold text-gray-900">{calories} kcal</div>
      <div className="text-lg font-medium mt-1">{mealName}</div>

      <div className="flex items-center gap-4 mt-4">
        <span className="flex items-center gap-1 text-sm">
          <img src="/icons/calendar.png" />
          {formatDate(date)}
        </span>

        <span className="text-gray-300">•</span>

        <span className="flex items-center gap-1 text-sm">
          <img src="/icons/clock.png" />
          {formatTime(time)}
        </span>
      </div>

      <p className="text-gray-700 mt-4 text-base">
        You are on track with your nutrition
      </p>
    </div>
  );
}

/* -----------------------------------------------------------
   Key Metrics
------------------------------------------------------------ */

function KeyMetrics({
  mealName,
  calories,
  fat,
  carbs,
  protein,
}: {
  mealName: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
}) {
  return (
    <div className="px-4 py-4 border-t">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Key Metrics</h2>
      </div>

      <MetricRow icon="/icons/note.png" label="Meal Name" value={mealName} />
      {/* <MetricRow icon="/icons/fire.png" label="Total Calories" value={`${calories} kcal`} /> */}
      <MetricRow icon="/icons/water drop.png" label="Total Fat" value={`${fat} g`} />
      <MetricRow icon="/icons/leaf single.png" label="Carbs" value={`${carbs} g`} />
      <MetricRow icon="/icons/bread toast.png" label="Protein" value={`${protein} g`} />
    </div>
  );
}

function MetricRow({ icon, label, value }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <img src={icon} className="w-5 h-5" />
        <p className="text-gray-700 text-base">{label}</p>
      </div>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}

/* -----------------------------------------------------------
   Macro Breakdown (+ Micros + Loader)
------------------------------------------------------------ */

function MacroBreakdown({
  calories,
  chartData,
  loadingNutrition,
  servingGrams,
  micros,
}: {
  calories: number;
  chartData: { name: string; value: number }[];
  loadingNutrition: boolean;
  servingGrams: number | null;
  micros: { label: string; value: number; unit: string }[];
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between pr-3">
        <h2 className="text-lg font-semibold ml-3">Macro Breakdown</h2>
        {loadingNutrition && (
          <div className="flex items-center gap-2 text-blue-600 text-xs">
            <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Updating…
          </div>
        )}
      </div>

      <div className="px-4 m-3 py-4 bg-white  rounded-3xl lg:rounded-xl">
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <PieChart width={250} height={250}>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={90}
                paddingAngle={5}
                cornerRadius={40}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>

            <div className="absolute text-center">
              <div className="text-3xl font-bold text-gray-900">{calories}</div>
              <div className="text-sm text-gray-500">kcal</div>
            </div>
          </div>

          <div className="flex justify-center gap-4 my-4 text-sm">
            <LegendItem color="bg-blue-600" label="Protein" />
            <LegendItem color="bg-yellow-500" label="Fat" />
            <LegendItem color="bg-green-500" label="Carbs" />
          </div>
        </div>

        {servingGrams && (
          <div className="text-xs text-gray-500 text-center mb-3">
            Calculated for ~{Math.round(servingGrams)} g inferred serving
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-lg font-semibold">Micronutrients</h3>
          {micros.length === 0 ? (
            <p className="text-sm text-gray-500 mt-1">
              Not available for this item.
            </p>
          ) : (
            <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2">
              {micros.map((m) => (
                <li key={m.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{m.label}</span>
                  <span className="font-medium text-gray-800">
                    {m.value} {m.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5">
            <h3 className="text-lg font-semibold">Balanced</h3>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Add fiber-rich foods (e.g., legumes, whole grains) for digestion
              and satiety.
            </p>

            {/* Macro rows */}
            {/* <MacroStatItem color="bg-blue-500" name="Protein" value={`${chartData[0].value} g`} />
            <hr />
            <MacroStatItem color="bg-yellow-500" name="Fat" value={`${chartData[1].value} g`} />
            <hr />
            <MacroStatItem color="bg-green-500" name="Carbs" value={`${chartData[2].value} g`} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`}></span>
      {label}
    </span>
  );
}

function MacroStatItem({ color, name, value }) {
  return (
    <div className="flex justify-between items-center text-base py-2">
      <span className="flex items-center gap-3 text-gray-700">
        <span className={`w-3 h-3 rounded-full ${color}`}></span>
        {name}
      </span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

/* -----------------------------------------------------------
   Footer Buttons
------------------------------------------------------------ */

function FooterButtons() {
  return (
    <footer className="sticky bottom-0 bg-white border-t p-4 flex flex-col gap-3 mt-8">
      <Link
        to="/wellness/ai-chat"
        className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-2xl text-base font-semibold bg-blue-600 text-white"
      >
        <img src="/icons/robot.png" />
        Consult AI Assistant
      </Link>
    </footer>
  );
}
