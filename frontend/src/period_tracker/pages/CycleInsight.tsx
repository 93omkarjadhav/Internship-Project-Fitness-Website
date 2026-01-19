import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cycleAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { format, parseISO, differenceInDays } from "date-fns";

const CycleInsight = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Set initial month to current month (January 2025 format)
  const getCurrentMonthValue = () => {
    const now = new Date();
    return format(now, "yyyy-MM");
  };

  const initialMonthFromState =
    (location.state as any)?.month && typeof (location.state as any)?.month === "string"
      ? (location.state as any).month
      : null;

  const [selectedMonth, setSelectedMonth] = useState(
    initialMonthFromState || getCurrentMonthValue()
  );

  useEffect(() => {
    fetchInsights();
  }, [selectedMonth]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await cycleAPI.getInsights();
      setInsights(response.data);
    } catch (error: any) {
      console.error("Error fetching insights:", error);
      toast({
        title: "Error",
        description: "Failed to load insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNormalStatus = (value: number, type: "cycle" | "period") => {
    if (type === "cycle") {
      if (value >= 21 && value <= 35) return "Normal";
      return "Irregular";
    } else {
      if (value >= 3 && value <= 7) return "Normal";
      return "Irregular";
    }
  };

  const avgCycleLength = insights?.avg_cycle_length ?? null;
  const avgPeriodLength = insights?.avg_period_length ?? null;
  const previousCycleLength = insights?.previous_cycle_length ?? null;
  const previousPeriodLength = insights?.previous_period_length ?? null;
  const totalCycles = insights?.total_cycles || 0;
  const recentCycles = insights?.recent_cycles || [];
  const commonSymptoms = insights?.most_common_symptoms || [];

  // Calculate average cycle length from recent cycles if backend doesn't provide it
  const calculateAverageCycleLength = () => {
    if (avgCycleLength && avgCycleLength > 0) {
      return avgCycleLength;
    }
    
    // Calculate from recent cycles (cycle length = time between consecutive period starts)
    if (recentCycles.length < 2) {
      return null; // Need at least 2 cycles to calculate average
    }
    
    const cycleLengths: number[] = [];
    for (let i = 0; i < recentCycles.length - 1; i++) {
      const currentCycle = recentCycles[i];
      const nextCycle = recentCycles[i + 1];
      
      if (currentCycle?.period_start_date && nextCycle?.period_start_date) {
        const currentStart = parseISO(currentCycle.period_start_date);
        const nextStart = parseISO(nextCycle.period_start_date);
        const length = differenceInDays(nextStart, currentStart);
        
        if (length > 0 && length <= 60) { // Valid cycle length (between 1-60 days)
          cycleLengths.push(length);
        }
      }
    }
    
    if (cycleLengths.length === 0) {
      return null;
    }
    
    const sum = cycleLengths.reduce((a, b) => a + b, 0);
    return sum / cycleLengths.length;
  };

  const calculatedAvgCycleLength = calculateAverageCycleLength();

  // Get current and previous cycles for comparison
  const currentCycle = recentCycles[0];
  const previousCycle = recentCycles[1];

  const getCurrentCycleDays = () => {
    if (!currentCycle?.period_start_date) return 0;
    const startDate = parseISO(currentCycle.period_start_date);
    const today = new Date();
    return differenceInDays(today, startDate) + 1;
  };

  const getPreviousCycleDays = () => {
    if (!previousCycle?.period_start_date) return 0;
    // Calculate cycle length: time from previous cycle start to current cycle start
    if (!currentCycle?.period_start_date) return 0;
    const previousStart = parseISO(previousCycle.period_start_date);
    const currentStart = parseISO(currentCycle.period_start_date);
    return differenceInDays(currentStart, previousStart);
  };

  const getPeriodLength = (cycle: any) => {
    if (!cycle?.period_start_date || !cycle?.period_end_date) return 0;
    const startDate = parseISO(cycle.period_start_date);
    const endDate = parseISO(cycle.period_end_date);
    const days = differenceInDays(endDate, startDate) + 1;
    // Cap period length at 14 days (max reasonable period length)
    // If it's more than 14, it's likely incorrect data entry
    return days > 14 ? 0 : days;
  };

  const getMostCommonSymptom = () => {
    if (!commonSymptoms || commonSymptoms.length === 0) {
      return { name: "None", count: 0, day: 0 };
    }
    return {
      name: commonSymptoms[0].symptom_type || "None",
      count: commonSymptoms[0].occurrence_count || commonSymptoms[0].count || 0,
      day: 3, // Default day, can be improved with actual data
    };
  };

  const mostCommon = getMostCommonSymptom();

  // Fallbacks for overview section:
  // If backend did not provide previous_cycle_length / previous_period_length,
  // derive them from recentCycles, but only use positive values.
  const derivedPreviousCycleDays =
    previousCycle && getPreviousCycleDays() > 0 ? getPreviousCycleDays() : null;

  const derivedPreviousPeriodDays =
    previousCycle && getPeriodLength(previousCycle) > 0
      ? getPeriodLength(previousCycle)
      : null;

  const overviewCycleLength =
    previousCycleLength !== null && previousCycleLength > 0
      ? previousCycleLength
      : derivedPreviousCycleDays;

  // Always recalculate period length from actual dates to ensure accuracy
  // Ignore backend value if it's invalid (> 14 days) - it's likely old incorrect data
  // Always prefer the derived value calculated from actual period_start_date and period_end_date
  const overviewPeriodLength = derivedPreviousPeriodDays !== null
    ? derivedPreviousPeriodDays
    : (previousPeriodLength !== null && previousPeriodLength > 0 && previousPeriodLength <= 14)
      ? previousPeriodLength
      : null;

  // Generate month options
  const getMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy"),
      });
    }
    return months;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back button - fixed position */}
      <button 
        onClick={() => {
          const fromPage = (location.state as any)?.from;
          if (fromPage) {
            navigate(fromPage);
          } else {
            navigate(-1);
          }
        }} 
        className="fixed top-4 left-4 z-50 p-2 hover:bg-blue-100 rounded-full transition-colors bg-white shadow-sm"
        aria-label="Go back"
      >
        <img src="/backarrow-Photoroom.png" alt="Back" className="w-6 h-6 object-contain" />
      </button>
      
      {/* Header */}
      <div className="sticky top-0 bg-blue-50 z-10 flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-4">
        </div>
      </div>

      {/* Title Section with Light Blue Background - Full Width */}
      <div className="w-full bg-blue-50 py-6 mb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <img src="/cycleinsight-removebg-preview.png" alt="Cycle Insight" className="w-[30px] h-[30px] object-contain" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Cycle Insight</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Track and analyze your key health indicators to optimize your wellness journey.
            </p>

            {/* Month Selector - Centered */}
            <div className="flex justify-center">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full sm:w-64 md:w-56 lg:w-48 bg-blue-50">
                  <div className="flex items-center gap-2 w-full justify-center">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <SelectValue placeholder="Select month" className="text-center" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">

        {/* Overview Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <img src="/bulb_photoroom.png" alt="Overview" className="w-5 h-5 object-contain" />
              <h2 className="text-lg font-normal">Overview</h2>
            </div>

          <div className="space-y-0">
            <div className="pb-4">
              <span className="text-sm text-muted-foreground block mb-2">Previous Cycle Length</span>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {overviewCycleLength !== null ? `${overviewCycleLength} days` : '--'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  overviewCycleLength === null
                    ? "bg-muted text-muted-foreground"
                    : getNormalStatus(overviewCycleLength, "cycle") === "Normal"
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {overviewCycleLength !== null && getNormalStatus(overviewCycleLength, "cycle") === "Normal" ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  {overviewCycleLength !== null ? getNormalStatus(overviewCycleLength, "cycle") : "Unknown"}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <span className="text-sm text-muted-foreground block mb-2">Previous Period Length</span>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {overviewPeriodLength !== null ? `${overviewPeriodLength} days` : '--'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  overviewPeriodLength === null
                    ? "bg-muted text-muted-foreground"
                    : getNormalStatus(overviewPeriodLength, "period") === "Normal"
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {overviewPeriodLength !== null && getNormalStatus(overviewPeriodLength, "period") === "Normal" ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  {overviewPeriodLength !== null ? getNormalStatus(overviewPeriodLength, "period") : "Unknown"}
                </span>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Cycle Comparison */}
        {currentCycle && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <img src="/column card.png" alt="Cycle Comparison" className="w-5 h-5 object-contain" />
                <h2 className="text-lg font-normal">Cycle Comparison</h2>
              </div>

            <div className="space-y-4">
              {/* Current Cycle */}
              {currentCycle && (
                <div className="pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-foreground">Current Cycle: {getCurrentCycleDays()} days</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {getPeriodLength(currentCycle)}-day period · Started {format(parseISO(currentCycle.period_start_date), "d MMM")}
                  </p>
                  <div className="flex gap-[3px] flex-wrap">
                    {[...Array(15)].map((_, i) => {
                      const periodLength = getPeriodLength(currentCycle);
                      const getDotColor = () => {
                        if (i < periodLength) {
                          // Custom color progression
                          if (i === 0) return "bg-[#E2E8F0]"; // 1st dot - gray/20
                          if (i === 1) return "bg-[#E2E8F0]"; // 2nd dot - gray/20
                          if (i === 2) return "bg-[#E2E8F0]"; // 3rd dot - gray/20
                          if (i === 3) return "bg-[#FECDD3]"; // 4th dot - destructive/20
                          if (i === 4) return "bg-[#FECDD3]"; // 5th dot - FECDD3
                          if (i === 5) return "bg-[#F43F5E]"; // 6th dot - destructive/50
                          return "bg-[#F43F5E]"; // 7th dot onwards
                        }
                        return "bg-[#E5E7EB]"; // Light gray for non-period days
                      };
                      return (
                        <div
                          key={i}
                          className={`h-[12px] w-[12px] rounded-full ${getDotColor()}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Previous Cycle */}
              {previousCycle && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-foreground">Previous Cycle: {getPreviousCycleDays()} days</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {getPeriodLength(previousCycle)}-day period · Started {format(parseISO(previousCycle.period_start_date), "d MMM")}
                  </p>
                  <div className="flex gap-[3px] flex-wrap">
                    {[...Array(15)].map((_, i) => {
                      const periodLength = getPeriodLength(previousCycle);
                      const getDotColor = () => {
                        if (i < periodLength) {
                          // Custom color progression
                          if (i === 0) return "bg-[#E2E8F0]"; // 1st dot - gray/20
                          if (i === 1) return "bg-[#E2E8F0]"; // 2nd dot - gray/20
                          if (i === 2) return "bg-[#E2E8F0]"; // 3rd dot - gray/20
                          if (i === 3) return "bg-[#FECDD3]"; // 4th dot - destructive/20
                          if (i === 4) return "bg-[#FECDD3]"; // 5th dot - FECDD3
                          if (i === 5) return "bg-[#F43F5E]"; // 6th dot - destructive/50
                          return "bg-[#F43F5E]"; // 7th dot onwards
                        }
                        return "bg-[#E5E7EB]"; // Light gray for non-period days
                      };
                      return (
                        <div
                          key={i}
                          className={`h-[12px] w-[12px] rounded-full ${getDotColor()}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Average Cycle Length - Previous 2 months timeline */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <img src="/icons/calendar.png" alt="Avg cycle length" className="w-5 h-5 object-contain" />
              <h2 className="text-lg font-semibold">Avg cycle length</h2>
            </div>

            {calculatedAvgCycleLength && (
              <p className="text-3xl font-bold mb-6">
                {Math.round(calculatedAvgCycleLength)} days
              </p>
            )}

            {/* Timeline: previous 2 months */}
            {(() => {
              const baseMonth =
                selectedMonth && selectedMonth !== ""
                  ? new Date(Number(selectedMonth.split("-")[0]), Number(selectedMonth.split("-")[1]) - 1, 1)
                  : new Date();

              const thisMonth = baseMonth;
              const nextMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 1);
              const prevMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1);

              const getMonthlyAvg = (monthDate: Date) => {
                const ym = format(monthDate, "yyyy-MM");
                const nextMonthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
                const nextYm = format(nextMonthDate, "yyyy-MM");
                
                // Get cycles that started in this month or next month (for month range)
                const monthRangeCycles = recentCycles.filter((cycle: any) => {
                  if (!cycle.period_start_date) return false;
                  const cycleMonth = format(parseISO(cycle.period_start_date), "yyyy-MM");
                  return cycleMonth === ym || cycleMonth === nextYm;
                }).sort((a: any, b: any) => {
                  return parseISO(a.period_start_date).getTime() - parseISO(b.period_start_date).getTime();
                });
                
                if (monthRangeCycles.length === 0) {
                  // If no cycles in this month range, use overall average or default
                  return calculatedAvgCycleLength || 28;
                }
                
                // Calculate cycle lengths from consecutive period starts in this month range
                const cycleLengths: number[] = [];
                for (let i = 0; i < monthRangeCycles.length - 1; i++) {
                  const currentCycle = monthRangeCycles[i];
                  const nextCycle = monthRangeCycles[i + 1];
                  
                  if (currentCycle?.period_start_date && nextCycle?.period_start_date) {
                    const currentStart = parseISO(currentCycle.period_start_date);
                    const nextStart = parseISO(nextCycle.period_start_date);
                    const length = differenceInDays(nextStart, currentStart);
                    
                    if (length > 0 && length <= 60) {
                      cycleLengths.push(length);
                    }
                  }
                }
                
                // If we have cycle_length from backend, use that too
                const backendLengths = monthRangeCycles
                  .map((c: any) => c.cycle_length)
                  .filter((len: any) => typeof len === "number" && len > 0 && len <= 60);
                
                const allLengths = [...cycleLengths, ...backendLengths];
                
                if (allLengths.length === 0) {
                  // If no cycle lengths calculated, use overall average or default
                  return calculatedAvgCycleLength || 28;
                }
                
                const sum = allLengths.reduce((a: number, b: number) => a + b, 0);
                return sum / allLengths.length;
              };

              const thisMonthLength = getMonthlyAvg(thisMonth);
              const prevMonthLength = getMonthlyAvg(prevMonth);

              const rows = [
                {
                  label: `${format(thisMonth, "MMMM")} - ${format(nextMonth, "MMMM")} (${format(
                    thisMonth,
                    "MMM"
                  )})`,
                  value: thisMonthLength,
                },
                {
                  label: `${format(prevMonth, "MMMM")} - ${format(thisMonth, "MMMM")} (${format(
                    prevMonth,
                    "MMM"
                  )})`,
                  value: prevMonthLength,
                },
              ];

              return (
                <div className="space-y-4">
                  {rows.map((row, index) => {
                    // Always show progress bar with blue fill, use calculated value or fallback
                    const displayValue = row.value && row.value > 0 ? row.value : (calculatedAvgCycleLength || 28);
                    const progress = Math.min((displayValue / 35) * 100, 100); // cap at 35 days
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">{row.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={progress}
                            className="h-2 flex-1 [&>div]:bg-[#2563EB]"
                          />
                          <span className="font-bold text-sm min-w-[60px] text-right">
                            {Math.round(displayValue)} d
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CycleInsight;
