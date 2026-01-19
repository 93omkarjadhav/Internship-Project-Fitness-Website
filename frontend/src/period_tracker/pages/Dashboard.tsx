import React, { useMemo, useState, useEffect } from "react";
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { cycleAPI, symptomAPI } from "@/lib/api";
import { parseISO } from "date-fns";
import OnboardingTour from "@/components/OnboardingTour";
import { Step } from "react-joyride";

type SymptomItem = { id: number; label: string };
type CycleItem = {
  id: number;
  period_start_date: string;
  period_end_date?: string;
  notes?: string;
};

const DEFAULT_LAST_PERIOD = new Date(2025, 9, 4);

const symptomOptions: SymptomItem[] = [
  { id: 1, label: "Mild cramps" },
  { id: 2, label: "Mood swings" },
  { id: 3, label: "Acne" },
  { id: 4, label: "Stomachache" },
  { id: 5, label: "Fatigue" },
];

function dateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, days: number) {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + days);
  return nd;
}
function diffDays(a: Date, b: Date) {
  const t = dateOnly(a).getTime() - dateOnly(b).getTime();
  return Math.round(t / (1000 * 60 * 60 * 24));
}

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState: any = location.state;

  const [selectedLastPeriod, setSelectedLastPeriod] = useState<Date>(DEFAULT_LAST_PERIOD);
  const [userCycleLength, setUserCycleLength] = useState<number>(28);
  const [userPeriodLength, setUserPeriodLength] = useState<number>(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([1, 2, 3]);
  const [cycleInsights, setCycleInsights] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [fetchedSymptoms, setFetchedSymptoms] = useState<any[]>([]);
  const [healthConditions, setHealthConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasRouteStateSymptoms, setHasRouteStateSymptoms] = useState(false);
  const [recentCycles, setRecentCycles] = useState<CycleItem[]>([]);
  const [allCycles, setAllCycles] = useState<CycleItem[]>([]); // All cycles for period date calculation
  const [showPeriodTour, setShowPeriodTour] = useState(false);

  const today = dateOnly(new Date());

  // Period Dashboard Onboarding Tour Steps
  const periodTourSteps: Step[] = [
    {
      target: '[data-tour="period-home-button"]',
      content: 'Press this button to go to the home page anytime.',
      title: 'Go to Home',
      placement: 'bottom',
      disableBeacon: true,
    },
  ];

  // Check if user has seen period dashboard tour
  useEffect(() => {
    const hasSeenPeriodTour = localStorage.getItem('hasSeenPeriodDashboardTour');
    if (!hasSeenPeriodTour) {
      // Show tour after a short delay to ensure elements are rendered
      setTimeout(() => {
        setShowPeriodTour(true);
      }, 1000);
    }
  }, []);

  const handlePeriodTourComplete = () => {
    setShowPeriodTour(false);
    localStorage.setItem('hasSeenPeriodDashboardTour', 'true');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh dashboard when refocused
  useEffect(() => {
    const handleFocus = () => fetchDashboardData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [dashboardRes, insightsRes, symptomRes, cyclesRes] = await Promise.all([
        cycleAPI.getDashboard().catch(() => ({ data: null })),
        cycleAPI.getInsights().catch(() => ({ data: null })),
        symptomAPI.list().catch(() => ({ data: null })),
        cycleAPI.getAll().catch(() => ({ data: [] })),
      ]);

      if (dashboardRes?.data) {
        setDashboardData(dashboardRes.data);
      }

      if (insightsRes?.data) {
        setCycleInsights(insightsRes.data);
        if (insightsRes.data.previous_cycle_length !== null) {
          setUserCycleLength(insightsRes.data.previous_cycle_length);
        }
        if (insightsRes.data.previous_period_length !== null) {
          setUserPeriodLength(insightsRes.data.previous_period_length);
        }
      }

      if (symptomRes?.data?.data) {
        const rows = symptomRes.data.data;
        setFetchedSymptoms(rows);

        const labels = rows.map((s: any) => s.symptom_type);
        // Update health conditions from API only if we don't have routeState symptoms
        if (labels.length > 0 && !hasRouteStateSymptoms) {
          setHealthConditions(labels);
        }
      }

      // Recent cycles for Cycle History section
      if (Array.isArray(cyclesRes?.data)) {
        const sorted = [...cyclesRes.data].sort((a: CycleItem, b: CycleItem) => {
          return new Date(b.period_start_date).getTime() - new Date(a.period_start_date).getTime();
        });
        setRecentCycles(sorted.slice(0, 3)); // For display
        setAllCycles(sorted); // All cycles for period date calculation
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load from routeState + localStorage
  useEffect(() => {
    if (routeState) {
      if (routeState.lastPeriodDate) setSelectedLastPeriod(new Date(routeState.lastPeriodDate));
      if (routeState.cycleLength) setUserCycleLength(Number(routeState.cycleLength));
      if (routeState.periodLength) setUserPeriodLength(Number(routeState.periodLength));

      if (Array.isArray(routeState.symptoms)) {
        // Update health conditions directly from route state
        setHealthConditions(routeState.symptoms);
        setHasRouteStateSymptoms(true);
        // Refresh dashboard data to get updated symptoms from API
        fetchDashboardData();
      } else {
        setHasRouteStateSymptoms(false);
      }
    }

    const raw = localStorage.getItem("mori_dashboard");
    if (raw) {
      const obj = JSON.parse(raw);

      if (obj.lastPeriodDate) setSelectedLastPeriod(new Date(obj.lastPeriodDate));
      if (obj.cycleLength) setUserCycleLength(Number(obj.cycleLength));
      if (obj.periodLength) setUserPeriodLength(Number(obj.periodLength));

      if (Array.isArray(obj.symptoms)) {
        setHealthConditions(obj.symptoms);

        const ids = symptomOptions
          .filter(s => obj.symptoms.includes(s.label))
          .map(s => s.id);

        setSelectedSymptoms(ids);
      }
    }

  }, [routeState]);

  const [predictedNextDate, setPredictedNextDate] = useState<Date | null>(null);

  useEffect(() => {
    if (routeState?.predictedDate) {
      setPredictedNextDate(new Date(routeState.predictedDate));
    } else {
      const raw = localStorage.getItem("mori_dashboard");
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj.predictedDate) {
          setPredictedNextDate(new Date(obj.predictedDate));
          return;
        }
      }
      setPredictedNextDate(addDays(selectedLastPeriod, userCycleLength));
    }
  }, [routeState, selectedLastPeriod, userCycleLength]);

  const predictedNextPeriod = predictedNextDate || dateOnly(addDays(selectedLastPeriod, userCycleLength));
  const daysUntilNextFromAPI = dashboardData?.next_period_days ?? null;
  const daysUntilNext =
    daysUntilNextFromAPI !== null ? daysUntilNextFromAPI : Math.max(0, diffDays(predictedNextPeriod, today));

  const ovulationDay = addDays(predictedNextPeriod, -14);
  const fertileStart = addDays(ovulationDay, -2);
  const fertileEnd = addDays(ovulationDay, 2);

  const predictedPeriodRange = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 0; i < userPeriodLength; i++) arr.push(addDays(predictedNextPeriod, i));
    return arr.map(dateOnly);
  }, [predictedNextPeriod, userPeriodLength]);

  const isInPeriod = (d: Date) =>
    predictedPeriodRange.some(pd => pd.getTime() === dateOnly(d).getTime());

  const daysSinceLast = Math.max(0, diffDays(today, selectedLastPeriod));
  const cycleProgressPct = Math.min(100, Math.round((daysSinceLast / userCycleLength) * 100));

  const R = 36;
  const C = 2 * Math.PI * R;

  // Get actual period dates from ALL cycles (not just recent 3 for display)
  const actualPeriodDates = useMemo(() => {
    const dates: Date[] = [];
    allCycles.forEach((cycle) => {
      if (cycle.period_start_date) {
        try {
          const start = parseISO(cycle.period_start_date);
          const startDate = dateOnly(start);
          
          // Determine period length: use period_length if available, otherwise use period_end_date, otherwise default to 5
          let periodLength = 5; // default
          if (cycle.period_length && cycle.period_length > 0 && cycle.period_length <= 14) {
            periodLength = cycle.period_length;
          } else if (cycle.period_end_date) {
            // Calculate from end date
            const end = parseISO(cycle.period_end_date);
            const endDate = dateOnly(end);
            const diffTime = endDate.getTime() - startDate.getTime();
            periodLength = Math.max(1, Math.min(14, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1));
          }
          
          // Add all days in the period
          for (let i = 0; i < periodLength; i++) {
            const periodDay = addDays(startDate, i);
            dates.push(dateOnly(periodDay));
          }
        } catch (error) {
          console.error("Error processing cycle date:", error, cycle);
        }
      }
    });
    return dates;
  }, [allCycles]);

  const mini7 = useMemo(() => {
    const arr: Date[] = [];
    // Show 7 days starting from 3 days before today
    const startBase = addDays(today, -3);
    for (let i = 0; i < 7; i++) arr.push(addDays(startBase, i));
    return arr;
  }, [today]);
  const cycleIsNormal =
  cycleInsights?.previous_cycle_length >= 21 &&
  cycleInsights?.previous_cycle_length <= 35;

const periodIsNormal =
  cycleInsights?.previous_period_length >= 3 &&
  cycleInsights?.previous_period_length <= 7;


  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-4 scale-[1.05] sm:scale-100">
      

      <div className="w-full max-w-[1000px] min-h-[90vh] lg:h-[90vh] flex flex-col lg:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Left side */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-200 bg-[#FDF2F8]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#FDF2F8] z-10 py-3">
            <img
              src="/week2-assets/chevron left.png"
              alt="left icon"
              className="w-5 h-5 object-contain text-black cursor-pointer"
              onClick={() => {
                navigate("/period/next-period");
              }}
            />
            <div className="text-lg font-semibold text-black text-center flex-1">Cycle</div>
            <button
              onClick={() => navigate("/welcome")}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              data-tour="period-home-button"
              aria-label="Go to home page"
            >
              Home
            </button>
          </div>

          {/* Mini Calendar */}
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-1 sm:gap-0">
            {mini7.map((d, i) => {
              // Normalize the date for comparison
              const normalizedDate = dateOnly(d);
              // Check if this date is in actual logged period dates
              const isActualPeriodDate = actualPeriodDates.some(
                (pd) => {
                  const normalizedPd = dateOnly(pd);
                  return normalizedPd.getTime() === normalizedDate.getTime();
                }
              );
              const label = d.toLocaleDateString("en-US", { weekday: "short" })[0];
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="relative w-8 h-16 sm:w-10 sm:h-20 flex flex-col items-center justify-center rounded-full bg-white border border-gray-300 shadow-md">
                    <span className="text-[10px] sm:text-[12px] text-gray-500 mb-1">{label}</span>
                    <span className={`text-sm sm:text-base font-regular ${isActualPeriodDate ? "text-gray-500" : "text-gray-800"}`}>
                      {d.getDate()}
                    </span>
                    {isActualPeriodDate && <div className="absolute bottom-1 sm:bottom-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F43F5E] rounded-full z-10"></div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cycle Progress */}
          <div className="flex flex-col items-center py-3 border-t border-gray-200 pt-5 mt-4">
            <div className="relative mb-3">
              <svg width="92" height="92" viewBox="0 0 92 92">
                <g transform="translate(46,46)">
                  <circle r={R} fill="#ffeef0" />
                  <circle r={R} fill="transparent" stroke="#fbd5da" strokeWidth="8" />
                  <circle
                    r={R}
                    fill="transparent"
                    stroke="#f43f5e"
                    strokeWidth="8"
                    strokeDasharray={`${C}`}
                    strokeDashoffset={`${(C * (100 - cycleProgressPct)) / 100}`}
                    strokeLinecap="round"
                    transform="rotate(-90)"
                  />
                </g>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center top-1/2 transform -translate-y-1/2">
                <img src="/week2-assets/anatomy ovarium (1).png" alt="period" className="w-9 h-8" />
              </div>
            </div>

            <div className="text-gray-500 text-base sm:text-sm">Your next period is in</div>
            <div className="text-4xl sm:text-4xl font-bold mt-2">{daysUntilNext} days</div>
            <div className="text-gray-600 text-base sm:text-sm mt-3 sm:mt-4 px-2 text-center">
              {cycleIsNormal && periodIsNormal ? "Low chance of getting pregnant" : "Check insights for anomalies"}
            </div>

              {/* <button 
              onClick={() => navigate("/period/log-cycle", { state: { from: "/dashboard" } })}
              className="mt-6 sm:mt-9 bg-[#F43F5E] hover:bg-[#F43F5E] text-white px-5 py-2 rounded-xl font-medium text-base sm:text-center"
            >
              Log period 
            </button> */}
            <Link
              to="/period/log-cycle"
              state={{ from: "/period/dashboard" }}
              className="mt-2 sm:mt-4 px-7 py-2.5 border bg-[#F43F5E] border-[#EF4444] text-white font-medium rounded-xl transition-colors text-sm"
            >
              Log period
            </Link>
              <button
                  onClick={() => navigate("/period/cycle-calendar")}
  className="mt-2 sm:mt-4 px-4 py-2.5 bg-white border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] font-medium rounded-xl transition-colors text-sm"
>
  Go to Calendar
</button>
          </div>
        </div>

        {/* Right side */}
        <div className="w-full lg:w-1/2 overflow-y-auto p-4 sm:p-6">
        


         {/* Cycle Insight HEADER OUTSIDE */}
<div className="flex items-center justify-between mb-2 sm:mb-3 mt-6">
  <div className="flex items-center gap-2">
    <img
      src="/week2-assets/light bulb.png"
      alt="cycle insight icon"
      className="w-5 h-5 sm:w-5 sm:h-5 object-contain"
    />
    <h2 className="text-gray-800 font-semibold text-base sm:text-base">
      Cycle Insight
    </h2>
  </div>

  <div
    className="text-[14px] sm:text-sm text-blue-500 font-medium cursor-pointer"
    onClick={() => navigate("/period/cycle-insight", { state: { from: "/period/dashboard" } })}
  >
    See All
  </div>
</div>

{/* Cycle Insight CARD */}
<div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 mb-4 sm:mb-6">
  <div className="space-y-4 sm:space-y-5">
   

    {/* Previous Period Length */}
    <div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600 text-xs sm:text-sm">Previous Cycle Length</span>
        <div className="flex items-center gap-2">
          {cycleInsights?.previous_cycle_length !== null && cycleInsights?.previous_cycle_length !== undefined && 
           cycleInsights.previous_cycle_length >= 21 && cycleInsights.previous_cycle_length <= 35 ? (
            <div className="bg-[#ECFDF5] text-[#10B981] text-[12px] sm:text-xs font-medium px-3 sm:px-5 py-2 rounded-full flex items-center gap-1 ">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Normal
            </div>
          ) : (
            <div className="bg-red-100 text-red-600 text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
              Abnormal
            </div>
          )}
        </div>
      </div>

    <p className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-1">
  {cycleInsights?.previous_cycle_length !== null && cycleInsights?.previous_cycle_length !== undefined
    ? `${cycleInsights.previous_cycle_length} days`        
    : "--"}
</p>

    </div>
 


              <hr className="border-gray-200" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-xs sm:text-sm">Previous Period Length</span>
                  <div className="flex items-center gap-2">
                    {cycleInsights?.previous_period_length !== null && cycleInsights?.previous_period_length !== undefined &&
                     cycleInsights.previous_period_length >= 3 && cycleInsights.previous_period_length <= 7 ? (
                      <div className="bg-[#ECFDF5] text-[#10B981] text-[10px] sm:text-xs font-medium px-3 sm:px-5 py-2 rounded-full flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Normal
                      </div>
                    ) : (
                      <div className="bg-red-100 text-[#F43F5E] text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
                        Abnormal
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-semibold text-gray-800 mt-1">
                  {cycleInsights?.previous_period_length !== null && cycleInsights?.previous_period_length !== undefined
                    ? `${cycleInsights.previous_period_length} days`
                    : "--"}
                </p>
              </div>
            </div>
          </div>

       {/* 3 CLEAN MATCHING CARDS */}
   <div className="flex items-center justify-between mb-2 sm:mb-3 mt-6">
  <div className="flex items-center gap-2">
    <img
      src="/week2-assets/Vector (10).png"
      alt="cycle History icon"
      className="w-5 h-5 sm:w-5 sm:h-5 object-contain"
    />
    <h2 className="text-gray-800 font-semibold text-base sm:text-base">
      Cycle History
    </h2>
  </div>

  <div
    className="text-[14px] sm:text-sm text-blue-500 font-medium cursor-pointer"
    onClick={() => navigate("/period/cycle-history", { state: { from: "/period/dashboard" } })}
  >
    See All
  </div>
</div>
<div className="space-y-4 sm:space-y-5">
  {recentCycles.map((cycle, idx) => {
    const startDate = new Date(cycle.period_start_date);
    const labelDate = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const dayNumber = Math.max(1, diffDays(today, startDate) + 1);

    return (
      <button
        key={cycle.id}
        className="bg-white rounded-2xl shadow-lg p-4 sm:p-5 w-full text-left hover:opacity-90 transition"
        onClick={() => navigate("/period/cycle-insight", { state: { from: "/period/dashboard" } })}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/week2-assets/Vector (12).png"
              alt="cycle"
              className="w-4 h-4 sm:w-5 sm:h-5 mt-4"
            />
            <div className="font-semibold text-[16px] sm:text-base">Day {dayNumber}</div>
          </div>
          <div className="flex items-center gap-1">
            <div className="text-gray-500 text-xs sm:text-sm">{labelDate}</div>
            <img
              src="/week2-assets/chevron right (1).png"
              alt="chevron"
              className="w-5 h-5 sm:w-5 sm:h-5 object-contain"
            />
          </div>
        </div>

        {idx === 0 && (
          <div className="flex items-center gap-1 mt-2 text-[13px] sm:text-xs ml-4">
            <IoCheckmarkCircleSharp className="w-4 h-4 sm:w-4 sm:h-4 text-green-600 ml-2" />
            <span className="text-gray-600">Next period in {daysUntilNext} days</span>
          </div>
        )}
      </button>
    );
  })}
  {recentCycles.length === 0 && (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-5">
      <p className="text-sm text-muted-foreground">No cycle history yet. Log your cycle to see entries here.</p>
    </div>
  )}
</div>


{/* Cycle Symptoms / Health Conditions CARD */}
<>
  <div className="flex items-center justify-between mb-2 sm:mb-3 mt-6">
    <div className="flex items-center gap-2">
      <img
        src="/week2-assets/virus.png"
        alt="cycle symptoms icon"
        className="w-5 h-5 sm:w-5 sm:h-5 object-contain"
      />
      <h2 className="text-gray-800 font-semibold text-base sm:text-base">
        Health Conditions
      </h2>
    </div>

    <div
      className="text-[14px] sm:text-sm text-blue-500 font-medium cursor-pointer"
      onClick={() => navigate("/period/symptoms", { 
        state: { 
          existingSymptoms: healthConditions,
          fromDashboard: true 
        } 
      })}
    >
      Edit
    </div>
  </div>
  <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 sm:mb-6">
    {healthConditions && healthConditions.length > 0 ? (
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1 sm:mb-2">
        {Array.from(new Set(healthConditions)).map((label, i) => (
          <div
            key={i}
            className="px-2.5 sm:px-3 py-2 border border-gray-200 rounded-[10px] text-[12px] sm:text-sm bg-white"
          >
            {label}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">
        No health conditions selected yet. Tap <span className="font-medium">Edit</span> to log them.
      </p>
    )}
  </div>
</>


          <div className="h-8" />
        </div>
      </div>

      {/* Period Dashboard Onboarding Tour */}
      <OnboardingTour
        steps={periodTourSteps}
        run={showPeriodTour}
        onComplete={handlePeriodTourComplete}
        onSkip={handlePeriodTourComplete}
      />
    </div>
  );
};

export default Dashboard;

