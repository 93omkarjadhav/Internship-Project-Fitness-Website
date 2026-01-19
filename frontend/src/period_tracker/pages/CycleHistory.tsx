import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Filter, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cycleAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { format, parseISO, differenceInDays } from "date-fns";

interface Cycle {
  id: number;
  period_start_date: string;
  period_end_date?: string;
  flow_intensity?: string;
  notes?: string;
  created_at: string;
}

const CycleHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCycles, setFilteredCycles] = useState<Cycle[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all"); // 'all' or '01'...'12'
  const [selectedYear, setSelectedYear] = useState<string>("all"); // 'all' or '2024', '2025', etc.

  useEffect(() => {
    fetchCycles();
  }, []);

  useEffect(() => {
    filterCycles();
  }, [searchQuery, cycles, selectedMonth, selectedYear]);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const response = await cycleAPI.getAll();
      setCycles(response.data || []);
    } catch (error: any) {
      console.error("Error fetching cycles:", error);
      toast({
        title: "Error",
        description: "Failed to load cycle history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCycles = () => {
    let filtered = [...cycles];

    // Apply year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter((cycle) => {
        const date = parseISO(cycle.period_start_date);
        const year = format(date, "yyyy");
        return year === selectedYear;
      });
    }

    // Apply month sort/filter (by calendar month only, Jan–Dec)
    if (selectedMonth !== "all") {
      filtered = filtered.filter((cycle) => {
        const date = parseISO(cycle.period_start_date);
        const month = format(date, "MM"); // 01–12
        return month === selectedMonth;
      });
    }

    // Apply search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((cycle) => {
        const searchLower = searchQuery.toLowerCase();
        const dateStr = format(parseISO(cycle.period_start_date), "dd MMM yyyy");
        const notes = cycle.notes?.toLowerCase() || "";
        const dayNumber = calculateDayNumber(cycle);
        const phase = getPhase(dayNumber).toLowerCase();
        
        // Search by date, notes, flow intensity, day number, or phase
        return (
          dateStr.toLowerCase().includes(searchLower) ||
          notes.includes(searchLower) ||
          cycle.flow_intensity?.toLowerCase().includes(searchLower) ||
          phase.includes(searchLower) ||
          `day ${dayNumber}`.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredCycles(filtered);
  };

  const groupCyclesByDate = (cyclesList: Cycle[]) => {
    const grouped: { [key: string]: Cycle[] } = {};
    
    cyclesList.forEach((cycle) => {
      const dateKey = format(parseISO(cycle.period_start_date), "dd MMM yyyy");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(cycle);
    });

    return Object.entries(grouped).sort((a, b) => {
      return parseISO(b[1][0].period_start_date).getTime() - parseISO(a[1][0].period_start_date).getTime();
    });
  };

  const calculateDayNumber = (cycle: Cycle) => {
    const startDate = parseISO(cycle.period_start_date);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const getPhase = (dayNumber: number) => {
    if (dayNumber <= 5) return "Menstrual Phase";
    if (dayNumber <= 13) return "Follicular Phase";
    if (dayNumber <= 16) return "Ovulation Phase";
    return "Luteal Phase";
  };

  const calculateNextPeriod = (cycle: Cycle) => {
    const startDate = parseISO(cycle.period_start_date);
    const avgCycleLength = 28; // Default, can be improved with actual cycle data
    const nextPeriodDate = new Date(startDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);
    const today = new Date();
    const daysUntil = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const handleDeleteCycle = async (cycleId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    
    if (!window.confirm("Are you sure you want to delete this cycle entry?")) {
      return;
    }

    try {
      await cycleAPI.delete(cycleId);
      toast({
        title: "Success",
        description: "Cycle entry deleted successfully",
      });
      // Refresh the cycles list
      fetchCycles();
    } catch (error: any) {
      console.error("Error deleting cycle:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete cycle entry",
        variant: "destructive",
      });
    }
  };

  const groupedCycles = groupCyclesByDate(filteredCycles);
  const monthOptions = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate year options - include years from 2019 to 2026
  const getYearOptions = () => {
    const years = new Set<string>();
    
    // Add years from cycle data
    cycles.forEach((cycle) => {
      const year = format(parseISO(cycle.period_start_date), "yyyy");
      years.add(year);
    });
    
    // Ensure we have years from 2019 to 2026
    for (let year = 2019; year <= 2026; year++) {
      years.add(year.toString());
    }
    
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  };

  const yearOptions = getYearOptions();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cycle history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => {
                // Navigate to dashboard if coming from there, otherwise check location state
                const fromPage = (location.state as any)?.from;
                if (fromPage === "/period/dashboard") {
                  navigate("/period/dashboard");
                } else {
                  // Default to dashboard for user-friendly navigation
                  navigate("/period/dashboard");
                }
              }} 
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Go back to dashboard"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
          </div>
          <div className="mb-2">
            <h1 className="text-3xl font-semibold mb-3">Cycle History</h1>
            <p className="text-sm font-semibold" style={{ color: '#4B5563' }}>
              Understand your period patterns and improve your health.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
        {/* All History and Search Bar - No Container */}
        <div className="mb-6">
          {/* Desktop: Search + Sort by month row (funnel inside search bar) */}
          <div className="hidden lg:flex items-center justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <img
                src="/Vector (1).png"
                alt="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 object-contain"
              />
              <Input
                type="text"
                placeholder="Search for a log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-background w-full"
              />
              {/* Sort by date filters inside search bar (right side) */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "#2563EB" }}>Sort by date</span>
                {/* Combined Year and Month Select */}
                <Select 
                  value={selectedYear !== "all" ? `year-${selectedYear}` : selectedMonth !== "all" ? `month-${selectedMonth}` : "all"}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedYear("all");
                      setSelectedMonth("all");
                    } else if (value.startsWith("year-")) {
                      setSelectedYear(value.replace("year-", ""));
                      setSelectedMonth("all");
                    } else if (value.startsWith("month-")) {
                      setSelectedMonth(value.replace("month-", ""));
                      setSelectedYear("all");
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-32 border border-gray-300 rounded-md shadow-none text-xs bg-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">All</SelectItem>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">YEAR</div>
                    {yearOptions.map((year) => (
                      <SelectItem key={`year-${year}`} value={`year-${year}`}>
                        {year}
                      </SelectItem>
                    ))}
                    <div className="border-t my-1"></div>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">MONTH</div>
                    {monthOptions.map((m) => (
                      <SelectItem key={`month-${m.value}`} value={`month-${m.value}`}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* Mobile: Search + Sort by month stacked */}
          <div className="flex flex-col gap-4 mb-4 lg:hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All History</h2>
            </div>
            
            {/* Mobile: Sort by date above search bar */}
            <div className="flex items-center justify-end gap-2">
              <Filter className="w-5 h-5" style={{ color: "#2563EB" }} />
              {/* Combined Year and Month Select */}
              <Select 
                value={selectedYear !== "all" ? `year-${selectedYear}` : selectedMonth !== "all" ? `month-${selectedMonth}` : "all"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setSelectedYear("all");
                    setSelectedMonth("all");
                  } else if (value.startsWith("year-")) {
                    setSelectedYear(value.replace("year-", ""));
                    setSelectedMonth("all");
                  } else if (value.startsWith("month-")) {
                    setSelectedMonth(value.replace("month-", ""));
                    setSelectedYear("all");
                  }
                }}
              >
                <SelectTrigger className="h-8 w-32 border border-gray-300 rounded-md shadow-none text-sm bg-white">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All</SelectItem>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">YEAR</div>
                  {yearOptions.map((year) => (
                    <SelectItem key={`year-${year}`} value={`year-${year}`}>
                      {year}
                    </SelectItem>
                  ))}
                  <div className="border-t my-1"></div>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">MONTH</div>
                  {monthOptions.map((m) => (
                    <SelectItem key={`month-${m.value}`} value={`month-${m.value}`}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search bar */}
            <div className="relative w-full">
              <img
                src="/Vector (1).png"
                alt="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 object-contain"
              />
              <Input
                type="text"
                placeholder="Search for a log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>
          {/* Desktop: All History heading */}
          <h2 className="text-lg font-semibold hidden lg:block">All History</h2>
        </div>

        {/* Cycle List */}
        {groupedCycles.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-period-pink flex items-center justify-center">
                <img src="/image.png" alt="Cycle icon" className="w-8 h-8 object-contain" />
              </div>
              <p className="text-muted-foreground mb-4">No cycles logged yet</p>
              <Button 
                onClick={() => navigate("/period/log-cycle", { state: { from: "/period/cycle-history" } })}
                className="rounded-xl"
              >
                Log Your First Cycle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {groupedCycles.map(([dateKey, dateCycles]) => (
              <div key={dateKey} className="space-y-2">
                {dateCycles.map((cycle, index) => {
                  const dayNumber = calculateDayNumber(cycle);
                  const phase = getPhase(dayNumber);
                  const startDate = parseISO(cycle.period_start_date);
                  const nextPeriod = calculateNextPeriod(cycle);
                  const isLastInGroup = index === dateCycles.length - 1;

                  return (
                  <Card key={cycle.id} className="mb-2">
                          <CardContent className="p-4">
                        <div className="w-full flex items-center justify-between">
                          <button
                            onClick={() =>
                              navigate("/period/cycle-insight", {
                                state: {
                                  from: "/period/cycle-history",
                                  month: format(startDate, "yyyy-MM"),
                                },
                              })
                            }
                            className="flex items-center justify-between flex-1 min-w-0 hover:opacity-80 transition-opacity"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <img src="/image-removebg-preview.png" alt="Cycle icon" className="w-6 h-6 object-contain flex-shrink-0" />
                              <div className="text-left flex-1 min-w-0">
                                <div className="font-semibold text-base">Day {dayNumber}</div>
                                <div className="text-sm text-muted-foreground">{phase}</div>
                                {isLastInGroup && nextPeriod > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <img src="/Vector.png" alt="Next period" className="w-4 h-4 object-contain" />
                                    <span className="text-xs text-muted-foreground">
                                      Next period in <span style={{ color: '#4B5563' }}>{nextPeriod}d</span>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold text-gray-600">
                                {format(startDate, "dd MMM")}
                              </span>
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </button>
                          <button
                            onClick={(e) => handleDeleteCycle(cycle.id, e)}
                            className="ml-2 p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
                            title="Delete cycle entry"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default CycleHistory;
