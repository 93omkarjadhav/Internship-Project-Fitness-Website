import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { cycleAPI } from "@/lib/api";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, addMonths, subMonths, getYear, getMonth } from "date-fns";
import { toast } from "@/hooks/use-toast";

const CycleCalendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<"month" | "year">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const response = await cycleAPI.getAll();
      setCycles(response.data || []);
    } catch (error: any) {
      console.error("Error fetching cycles:", error);
      toast({
        title: "Error",
        description: "Failed to load cycles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const isPeriodDay = (date: Date) => {
    return cycles.some((cycle) => {
      if (!cycle.period_start_date) return false;
      const startDate = new Date(cycle.period_start_date);
      const endDate = cycle.period_end_date ? new Date(cycle.period_end_date) : startDate;
      return date >= startDate && date <= endDate && isSameMonth(date, currentDate);
    });
  };

  const hasCycleEntry = (date: Date) => {
    return cycles.some((cycle) => {
      const cycleDate = new Date(cycle.period_start_date);
      return isSameDay(cycleDate, date);
    });
  };

  const handleDateClick = (date: Date) => {
    if (!isSameMonth(date, currentDate)) {
      setCurrentDate(date);
      return;
    }
    setSelectedDate(date);
    
    // Find cycle for this date
    const cycle = cycles.find((c) => {
      const cycleDate = new Date(c.period_start_date);
      return isSameDay(cycleDate, date);
    });

    if (cycle) {
      navigate("/period/log-cycle", { state: { from: "/cycle-calendar", cycleId: cycle.id } });
    } else {
      toast({
        title: "No cycle found",
        description: `No cycle logged for ${format(date, "dd MMM yyyy")}`,
      });
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Generate months for year view
  const getYearMonths = () => {
    const year = getYear(currentDate);
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(new Date(year, i, 1));
    }
    return months;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => {
                navigate("/period/dashboard");
              }} 
              className="p-2 -ml-2"
            >
              <img src="/backarrow-Photoroom.png" alt="Back" className="w-6 h-6 object-contain" />
            </button>
            <h1 className="text-xl font-semibold">Cycle Calendar</h1>
            <button className="p-2 -mr-2">
              <img src="/bell-Photoroom.png" alt="Notifications" className="w-6 h-6 object-contain" />
            </button>
          </div>

          {/* View Toggle - Month/Year - Top */}
          <div className="flex justify-center mb-3">
            <div className="relative inline-flex bg-gray-200/30 rounded-lg p-1">
              <button
                onClick={() => setView("month")}
                className={`relative px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                  view === "month"
                    ? "text-gray-900 bg-white shadow-sm font-semibold"
                    : "text-gray-500 font-medium"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView("year")}
                className={`relative px-4 py-2 rounded-md text-sm transition-all duration-200 ${
                  view === "year"
                    ? "text-gray-900 bg-white shadow-sm font-semibold"
                    : "text-gray-500 font-medium"
                }`}
              >
                Year
              </button>
            </div>
          </div>

          {/* Separator */}
          <hr className="border-gray-200 mb-2" />

          {/* Date Navigation - Below Separator */}
          <div className="flex items-center justify-center gap-1">
            {view === "month" && (
              <>
                <button onClick={goToPreviousMonth} className="p-2 hover:bg-secondary rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-4 py-1 text-base font-semibold text-[#2563EB] min-w-[140px] text-center">
                  {format(currentDate, "MMMM yyyy")}
                </div>
                <button onClick={goToNextMonth} className="p-2 hover:bg-secondary rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {view === "year" && (
              <>
                <button
                  onClick={() => setCurrentDate(subMonths(currentDate, 12))}
                  className="p-2 hover:bg-secondary rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-base font-semibold min-w-[100px] text-center">
                  {getYear(currentDate)}
                </span>
                <button
                  onClick={() => setCurrentDate(addMonths(currentDate, 12))}
                  className="p-2 hover:bg-secondary rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Separator - Same as Top */}
          <hr className="border-gray-200 mt-2" />
        </div>
      </div>

      {/* Calendar Content - Desktop: Split Left/Right, Mobile: Single Column */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-2 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Side - Calendar */}
          <Card className="h-fit">
            <CardContent className="p-4 sm:p-6">
              {view === "month" ? (
                <div>
                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day}
                        className="text-center text-base text-muted-foreground font-semibold py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth().map((date, index) => {
                      const isCurrentMonth = isSameMonth(date, currentDate);
                      const isCurrentDay = isToday(date);
                      const isPeriod = isPeriodDay(date);
                      const hasEntry = hasCycleEntry(date);
                      const isSelected = selectedDate && isSameDay(date, selectedDate);
                      const showBlueDot = isPeriod || hasEntry;

                      return (
                        <button
                          key={index}
                          onClick={() => handleDateClick(date)}
                          className={`aspect-square flex flex-col items-center justify-center rounded-full text-base transition-colors relative ${
                            !isCurrentMonth
                              ? "text-muted-foreground/40"
                              : isSelected
                              ? "bg-[#2563EB] text-white font-semibold"
                              : isCurrentDay && !isSelected
                              ? "text-foreground font-semibold"
                              : "text-foreground hover:bg-secondary"
                          }`}
                        >
                          <span className="mb-2">{format(date, "d")}</span>
                          {showBlueDot && !isSelected && (
                            <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#EF4444]"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Legend Section - Below Calendar */}
                  {/* <div className="mt-6 pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold mb-3">Legend</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center">
                          <span className="text-xs text-white font-semibold">15</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Selected Date</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-8 rounded-full border-2 border-gray-300 flex flex-col items-center justify-start pt-0.5 relative">
                          <span className="text-xs font-semibold">10</span>
                          <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#EF4444]"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">Period Day / Cycle Entry</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold">{format(new Date(), "d")}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Today</span>
                      </div>
                    </div>
                  </div> */}
                </div>
              ) : (
                // Year view: no cycle info, only year selection via header arrows
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
                  <h3 className="text-lg font-semibold">Year view</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Use the arrows above to change the year. Detailed cycle information is
                    available in the Month view.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Side - Cycle Info (Desktop Only, Month view only) */}
          {view === "month" && (
            <div className="hidden lg:block">
              <Card className="h-full">
                <CardContent className="p-6">
                  {/* <h2 className="text-xl font-semibold mb-4">Cycle Information</h2>
                  {selectedDate ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Selected Date: {format(selectedDate, "dd MMMM yyyy")}
                      </p>
                      {cycles.find((c) => {
                        const cycleDate = new Date(c.period_start_date);
                        return isSameDay(cycleDate, selectedDate);
                      }) ? (
                        <div className="mt-4">
                          <p className="text-sm font-medium">Cycle found for this date</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click on the date to view details
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-4">
                          No cycle logged for this date
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Click on a date to view cycle information
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></div>
                          <span className="text-sm">Period Days</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></div>
                          <span className="text-sm">Cycle Entries</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></div>
                          <span className="text-sm">Today</span>
                        </div>
                      </div>
                    </div> */}
                    
                  {/* )} */}
                    <div className="pt-4 border-border">
                    <h3 className="text-lg font-semibold mb-3">Legend</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center">
                          <span className="text-xs text-white font-semibold">15</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Selected Date</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-8 rounded-full border-2 border-gray-300 flex flex-col items-center justify-start pt-0.5 relative">
                          <span className="text-xs font-semibold">10</span>
                          <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#EF4444]"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">Period Day / Cycle Entry</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold">{format(new Date(), "d")}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Today</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CycleCalendar;
