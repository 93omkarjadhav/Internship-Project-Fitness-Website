import React, { useState, useEffect } from "react";
import { IoChevronBack } from "react-icons/io5";
import { createMeal } from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

type ServingUnit = "g" | "ml" | "cup" | "tbsp" | "piece" | "plate";

// export default function AddMealPage(): JSX.Element {
  export default function AddMealPage({
    onClose,
  }: {
    onClose?: () => void;
  }): JSX.Element {
  
  const [mealName, setMealName] = useState("");
  const [servingAmount, setServingAmount] = useState<number | "">(100);
  const [servingUnit, setServingUnit] = useState<ServingUnit>("g");
  const [mealCategory, setMealCategory] = useState("Breakfast");
  const [description, setDescription] = useState("");

  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fat, setFat] = useState(0);
  const [carb, setCarb] = useState(0);

  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const [mealDate, setMealDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [mealTime, setMealTime] = useState(
    () => new Date().toISOString().slice(11, 16)
  );

  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle"
  );
  const [formError, setFormError] = useState<string | null>(null);

  const navigate = useNavigate();
  const handleBack = () => {
    if (onClose) {
      // Drawer mode
      onClose();
    } else {
      // Full page mode
      navigate(-1);
    }
  };
  
  const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;

  /* ======================= USDA LOGIC ======================= */

  async function searchUSDA(foodName: string) {
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
        foodName
      )}&pageSize=5&api_key=${USDA_API_KEY}`
    );
    const data = await res.json();
    return data.foods?.[0] || null;
  }

  function getNutrient(food: any, name: string): number {
    return (
      food.foodNutrients?.find((n: any) => n.nutrientName === name)?.value || 0
    );
  }

  function getPortionGram(food: any, unit: ServingUnit): number | null {
    const portion = food.foodPortions?.find((p: any) =>
      p.measureUnit?.name?.toLowerCase().includes(unit)
    );
    return portion?.gramWeight ?? null;
  }

  function toGrams(amount: number, unit: ServingUnit, food: any): number {
    if (unit === "g" || unit === "ml") return amount;
    const portionGram = getPortionGram(food, unit);
    return portionGram ? amount * portionGram : amount * 100;
  }

  async function fetchNutrition() {
    if (!mealName.trim() || !servingAmount) return;

    setLoadingNutrition(true);

    try {
      const food = await searchUSDA(mealName);
      if (!food) return;

      const grams = toGrams(Number(servingAmount), servingUnit, food);
      const factor = grams / 100;

      setCalories(Math.round(getNutrient(food, "Energy") * factor));
      setProtein(Math.round(getNutrient(food, "Protein") * factor));
      setFat(Math.round(getNutrient(food, "Total lipid (fat)") * factor));
      setCarb(
        Math.round(
          getNutrient(food, "Carbohydrate, by difference") * factor
        )
      );
    } catch (err) {
      console.error("USDA ERROR:", err);
    } finally {
      setLoadingNutrition(false);
    }
  }

  useEffect(() => {
    const delay = setTimeout(fetchNutrition, 500);
    return () => clearTimeout(delay);
  }, [mealName, servingAmount, servingUnit]);

  /* ======================= SUBMIT ======================= */

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
  
    if (!mealName.trim()) {
      setFormError("Meal name is required.");
      return;
    }
  
    setStatus("saving");
  
    try {
      await createMeal({
        meal_name: mealName.trim(),
        meal_date: mealDate,
        meal_time: mealTime || "12:00",
        meal_type: mealCategory,
        calories,
        protein,
        fat,
        carbs: carb,
        notes: description || undefined,
      });
  
      setStatus("success");
  
      // ✅ Global toast (same style everywhere)
      toast.success("Meal logged successfully");
  
      // ✅ CLOSE DRAWER IMMEDIATELY
      setTimeout(() => {
        onClose();
      }, 500);
  
      // ✅ OPTIONAL: navigate after drawer closes
      setTimeout(() => {
        navigate("/nutrition-dashboard");
      }, 1000);
  
    } catch (error) {
      console.error(error);
      setStatus("error");
      toast.error("Failed to save meal. Please try again.");
    }
  }
  
  

  useEffect(() => {
    setShowDisclaimer(true);
  }, []);
  
  /* ======================= UI (UNCHANGED) ======================= */

  return (
    <div className="min-h-screen shadow-lg text-slate-900">
      <div className="max-w-xl  rounded-2xl mt-5 mx-auto md:max-w-6xl px-4 md:px-8 py-6">

        <header className="mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            {/* <Link
              to="/nutrition-dashboard"
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition flex-shrink-0"
            >
              <IoChevronBack className="w-6 h-6 text-gray-800" />
            </Link> */}
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
            >
              <IoChevronBack className="w-6 h-6 text-gray-800" />
            </button>


            <h1 className="text-lg md:text-2xl font-semibold">
              Add New Meal (Manual)
            </h1>
          </div>
        </header>

        {showDisclaimer && (
  <div className="mb-4 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
    <div className="mt-0.5 text-blue-600">
      ℹ️
    </div>

    <div className="flex-1 text-sm leading-snug">
      <p className="font-semibold">Important</p>
      <p className="text-blue-800">
        Enter the food quantity accurately in <b>grams</b> for best results.
        You can also manually adjust nutrition values if needed.
      </p>
    </div>

    {/* <button
      onClick={() => setShowDisclaimer(false)}
      className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
    >
      ✕
    </button> */}
  </div>
)}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Meal Name
                </label>
                <input
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g., rice, idli, dal fry"
                  className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold">
                    Serving Amount
                  </label>
                  <input
                    type="number"
                    value={servingAmount as any}
                    onChange={(e) =>
                      setServingAmount(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="mt-2 w-full bg-white border-2 border-gray-300 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold">
                    Serving Unit
                  </label>
                  <select
                    value={servingUnit}
                    onChange={(e) =>
                      setServingUnit(e.target.value as ServingUnit)
                    }
                    className="mt-2 w-full bg-white border-2 border-gray-300 rounded-xl px-3 py-2"
                  >
                    <option value="g">grams (g)</option>
                    <option value="ml">milliliters (ml)</option>
                    <option value="cup">cup (~240 ml)</option>
                    <option value="tbsp">tablespoon (~15 g)</option>
                    <option value="piece">piece</option>
                    <option value="plate">plate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Meal Category
                </label>
                <select
                  value={mealCategory}
                  onChange={(e) => setMealCategory(e.target.value)}
                  className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-3"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold">
                    Meal Date
                  </label>
                  <input
                    type="date"
                    value={mealDate}
                    onChange={(e) => setMealDate(e.target.value)}
                    className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold">
                    Meal Time
                  </label>
                  <input
                    type="time"
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                    className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2 w-full bg-white border-2 border-gray-200 rounded-3xl px-3 py-3 min-h-[120px]"
                />
                <div className="text-xs text-gray-400 mt-1">
                  {description.length}/300
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Nutritional Value</h3>
                {loadingNutrition && (
                  <div className="flex items-center gap-2 text-blue-600 text-xs">
                    <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold">Calories</label>
                <div className="mt-2 text-lg font-semibold">
                  {calories} kcal
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold">Protein</label>
                <input
                  value={protein + "g"}
                  onChange={(e) =>
                    setProtein(
                      Number(e.target.value.replace(/g/gi, "")) || 0
                    )
                  }
                  className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">Carb</label>
                <input
                  value={carb + "g"}
                  onChange={(e) =>
                    setCarb(
                      Number(e.target.value.replace(/g/gi, "")) || 0
                    )
                  }
                  className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">Fat</label>
                <input
                  value={fat + "g"}
                  onChange={(e) =>
                    setFat(
                      Number(e.target.value.replace(/g/gi, "")) || 0
                    )
                  }
                  className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 text-right">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
            >
              {status === "saving" ? "Saving..." : "Log Meal"}
            </button>
          </div>
        </form>

        {/* {status === "success" && (
          <div className="fixed right-6 bottom-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            Meal saved
          </div>
        )} */}
      </div>
    </div>
  );
}

































// import React, { useState, useEffect } from "react";
// import { IoChevronBack } from "react-icons/io5";
// import { createMeal } from "../lib/api";
// import { useNavigate, Link } from "react-router-dom";

// type ServingUnit = "g" | "ml" | "cup" | "tbsp" | "piece" | "plate";

// export default function AddMealPage(): JSX.Element {
//   const [mealName, setMealName] = useState("");
//   const [servingAmount, setServingAmount] = useState<number | "">(100);
//   const [servingUnit, setServingUnit] = useState<ServingUnit>("g");
//   const [mealCategory, setMealCategory] = useState("Breakfast");
//   const [description, setDescription] = useState("");

//   const [calories, setCalories] = useState(0);
//   const [protein, setProtein] = useState(0);
//   const [fat, setFat] = useState(0);
//   const [carb, setCarb] = useState(0);

//   const [mealDate, setMealDate] = useState(
//     () => new Date().toISOString().split("T")[0]
//   );
//   const [mealTime, setMealTime] = useState(
//     () => new Date().toISOString().slice(11, 16)
//   );

//   const [loadingNutrition, setLoadingNutrition] = useState(false);
//   const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
//     "idle"
//   );
//   const [formError, setFormError] = useState<string | null>(null);

//   const navigate = useNavigate();

//   /* ======================= EDAMAM CONFIG ======================= */

//   const EDAMAM_APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
//   const EDAMAM_APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;

//   /* ======================= EDAMAM LOGIC ======================= */

//   function buildIngredientLine(
//     amount: number,
//     unit: ServingUnit,
//     food: string
//   ): string {
//     return `${amount} ${unit} ${food}`;
//   }

//   async function fetchNutrition() {
//     if (!mealName.trim() || !servingAmount) return;
  
//     setLoadingNutrition(true);
  
//     try {
//       const cleanMealName = mealName.replace(/^\d+\s*/g, "").trim();
  
//       const res = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/edamam/nutrition?food=${encodeURIComponent(mealName)}`
//       );
      
  
//       const data = await res.json();
  
//       const food = data.parsed?.[0]?.food;
//       if (!food || !food.nutrients) return;
  
//       // nutrients are PER 100g
//       const factor =
//         servingUnit === "g" || servingUnit === "ml"
//           ? Number(servingAmount) / 100
//           : Number(servingAmount); // piece/cup approx handled manually later
  
//       setCalories(Math.round((food.nutrients.ENERC_KCAL || 0) * factor));
//       setProtein(Math.round((food.nutrients.PROCNT || 0) * factor));
//       setFat(Math.round((food.nutrients.FAT || 0) * factor));
//       setCarb(Math.round((food.nutrients.CHOCDF || 0) * factor));
//     } catch (err) {
//       console.error("EDAMAM ERROR:", err);
//     } finally {
//       setLoadingNutrition(false);
//     }
//   }
  

//   useEffect(() => {
//     const delay = setTimeout(fetchNutrition, 600);
//     return () => clearTimeout(delay);
//   }, [mealName, servingAmount, servingUnit]);

//   /* ======================= SUBMIT ======================= */

//   async function handleSubmit(e?: React.FormEvent) {
//     if (e) e.preventDefault();

//     if (!mealName.trim()) {
//       setFormError("Meal name is required.");
//       return;
//     }

//     setStatus("saving");

//     try {
//       await createMeal({
//         meal_name: mealName.trim(),
//         meal_date: mealDate,
//         meal_time: mealTime || "12:00",
//         meal_type: mealCategory,
//         calories,
//         protein,
//         fat,
//         carbs: carb,
//         notes: description || undefined,
//       });

//       setStatus("success");
//       setTimeout(() => navigate("/nutrition-schedule"), 1500);
//     } catch {
//       setStatus("error");
//     }
//   }

//   /* ======================= UI (UNCHANGED) ======================= */

//   return (
//     <div className="min-h-screen shadow-lg text-slate-900">
//       <div className="max-w-xl shadow-lg rounded-2xl mt-5 mx-auto md:max-w-4xl px-4 md:px-8 py-6">

//         {/* HEADER */}
//         <header className="mb-4 md:mb-6">
//           <div className="flex items-center gap-3">
//             <Link
//               to="/nutrition-dashboard"
//               className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition flex-shrink-0"
//               aria-label="Go back"
//             >
//               <IoChevronBack className="w-6 h-6 text-gray-800" />
//             </Link>
//             <h1 className="text-lg md:text-2xl font-semibold">
//               Add New Meal (Manual)
//             </h1>
//           </div>
//         </header>

//         {/* FORM */}
//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

//             {/* LEFT SIDE */}
//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Meal Name
//                 </label>
//                 <input
//                   value={mealName}
//                   onChange={(e) => setMealName(e.target.value)}
//                   placeholder="e.g., rice, idli, dal fry"
//                   className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-3"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-sm font-semibold">
//                     Serving Amount
//                   </label>
//                   <input
//                     type="number"
//                     value={servingAmount as any}
//                     onChange={(e) =>
//                       setServingAmount(
//                         e.target.value === "" ? "" : Number(e.target.value)
//                       )
//                     }
//                     className="mt-2 w-full bg-white border-2 border-gray-300 rounded-xl px-3 py-2"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold">
//                     Serving Unit
//                   </label>
//                   <select
//                     value={servingUnit}
//                     onChange={(e) =>
//                       setServingUnit(e.target.value as ServingUnit)
//                     }
//                     className="mt-2 w-full bg-white border-2 border-gray-300 rounded-xl px-3 py-2"
//                   >
//                     <option value="g">grams (g)</option>
//                     <option value="ml">milliliters (ml)</option>
//                     <option value="cup">cup (~240 ml)</option>
//                     <option value="tbsp">tablespoon (~15 g)</option>
//                     <option value="piece">piece</option>
//                     <option value="plate">plate</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold">
//                   Meal Category
//                 </label>
//                 <select
//                   value={mealCategory}
//                   onChange={(e) => setMealCategory(e.target.value)}
//                   className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-3"
//                 >
//                   <option>Breakfast</option>
//                   <option>Lunch</option>
//                   <option>Dinner</option>
//                   <option>Snack</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-semibold">
//                     Meal Date
//                   </label>
//                   <input
//                     type="date"
//                     value={mealDate}
//                     onChange={(e) => setMealDate(e.target.value)}
//                     className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-3"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold">
//                     Meal Time
//                   </label>
//                   <input
//                     type="time"
//                     value={mealTime}
//                     onChange={(e) => setMealTime(e.target.value)}
//                     className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-3"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold">
//                   Description (Optional)
//                 </label>
//                 <textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   className="mt-2 w-full bg-white border-2 border-gray-200 rounded-3xl px-3 py-3 min-h-[120px]"
//                 />
//                 <div className="text-xs text-gray-400 mt-1">
//                   {description.length}/300
//                 </div>
//               </div>
//             </div>

//             {/* RIGHT SIDE */}
//             <div className="space-y-6">
//               <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold">Nutritional Value</h3>
//                 {loadingNutrition && (
//                   <div className="flex items-center gap-2 text-blue-600 text-xs">
//                     <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
//                     Loading...
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold">Calories</label>
//                 <div className="mt-2 text-lg font-semibold">
//                   {calories} kcal
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold">Protein</label>
//                 <input
//                   value={protein + "g"}
//                   onChange={(e) =>
//                     setProtein(
//                       Number(e.target.value.replace(/g/gi, "")) || 0
//                     )
//                   }
//                   className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-2"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold">Carb</label>
//                 <input
//                   value={carb + "g"}
//                   onChange={(e) =>
//                     setCarb(
//                       Number(e.target.value.replace(/g/gi, "")) || 0
//                     )
//                   }
//                   className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-2"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold">Fat</label>
//                 <input
//                   value={fat + "g"}
//                   onChange={(e) =>
//                     setFat(
//                       Number(e.target.value.replace(/g/gi, "")) || 0
//                     )
//                   }
//                   className="mt-2 w-full bg-white border-2 border-gray-300 rounded-2xl px-4 py-2"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* SUBMIT */}
//           <div className="mt-6 text-right">
//             <button
//               type="submit"
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
//             >
//               {status === "saving" ? "Saving..." : "Log Meal"}
//             </button>
//           </div>
//         </form>

//         {status === "success" && (
//           <div className="fixed right-6 bottom-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
//             Meal saved
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
