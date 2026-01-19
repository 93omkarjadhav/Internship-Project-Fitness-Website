import { useState, useEffect } from "react";
import { Bell, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cycleAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";

const CycleDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const cycleId = searchParams.get("id");
  const [cycle, setCycle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState<any[]>([]);

  useEffect(() => {
    if (cycleId) {
      fetchCycleDetails();
    } else {
      toast({
        title: "Error",
        description: "No cycle ID provided",
        variant: "destructive",
      });
      const fromPage = (location.state as any)?.from || "/cycle-history";
      navigate(fromPage);
    }
  }, [cycleId]);

  const fetchCycleDetails = async () => {
    try {
      setLoading(true);
      const response = await cycleAPI.getById(Number(cycleId));
      setCycle(response.data);
      
      // Calculate cycle day
      if (response.data?.period_start_date) {
        const startDate = new Date(response.data.period_start_date);
        const today = new Date();
        const dayNumber = differenceInDays(today, startDate) + 1;
        setCycle((prev: any) => ({ ...prev, currentDay: dayNumber }));
      }

      // Fetch symptoms if available
      if (response.data?.symptoms) {
        setSymptoms(response.data.symptoms);
      }
    } catch (error: any) {
      console.error("Error fetching cycle details:", error);
      toast({
        title: "Error",
        description: "Failed to load cycle details",
        variant: "destructive",
      });
      const fromPage = (location.state as any)?.from || "/cycle-history";
      navigate(fromPage);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPeriod = () => {
    if (!cycle?.period_start_date) return null;
    
    const startDate = new Date(cycle.period_start_date);
    const avgCycleLength = cycle.cycle_length || 28; // Default 28 days
    const nextPeriodDate = addDays(startDate, avgCycleLength);
    const daysUntil = differenceInDays(nextPeriodDate, new Date());
    
    return { date: nextPeriodDate, days: daysUntil };
  };

  const getPhase = () => {
    if (!cycle?.currentDay) return "Unknown Phase";
    const day = cycle.currentDay;
    
    if (day <= 5) return "Menstrual Phase";
    if (day <= 13) return "Follicular Phase";
    if (day <= 16) return "Ovulation Phase";
    return "Luteal Phase";
  };

  const getRegularity = () => {
    if (!cycle?.cycle_length) return "Unknown";
    const length = cycle.cycle_length;
    
    if (length >= 21 && length <= 35) return "Regular";
    return "Irregular";
  };

  const getSymptomIntensity = () => {
    if (symptoms.length === 0) return "None";
    if (symptoms.length <= 2) return "Mild";
    if (symptoms.length <= 4) return "Moderate";
    return "Severe";
  };

  const getFertilityWindow = () => {
    if (!cycle?.currentDay) return "Unknown";
    const day = cycle.currentDay;
    
    if (day >= 12 && day <= 16) return "Active";
    return "Inactive";
  };

  const nextPeriod = calculateNextPeriod();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cycle details...</p>
        </div>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Cycle not found</p>
          <Button onClick={() => {
            const fromPage = (location.state as any)?.from || "/cycle-history";
            navigate(fromPage);
          }}>
            Back to History
          </Button>
        </div>
      </div>
    );
  }

  const metrics = [
    { 
      icon: () => <img src="/Vector (4).png" alt="Cycle Regularity" className="w-5 h-5" />, 
      label: "Cycle Regularity", 
      value: getRegularity() 
    },
    { 
      icon: () => <img src="/Vector (5).png" alt="Symptom Intensity" className="w-5 h-5" />, 
      label: "Symptom Intensity", 
      value: getSymptomIntensity() 
    },
    { 
      icon: () => <img src="/Vector (6).png" alt="Fertility Window" className="w-5 h-5" />, 
      label: "Fertility Window", 
      value: getFertilityWindow() 
    },
    { 
      icon: () => <img src="/Vector (7).png" alt="Period Duration" className="w-5 h-5" />, 
      label: "Period Duration", 
      value: cycle.period_length ? `${cycle.period_length} days` : "N/A" 
    },
  ];

  const cycleDate = cycle.period_start_date ? new Date(cycle.period_start_date) : new Date();
  const currentDay = cycle.currentDay || 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => {
                const fromPage = (location.state as any)?.from || "/cycle-history";
                navigate(fromPage);
              }} 
              className="p-2 -ml-2"
            >
              <svg className="w-6 h-6 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Cycle Details</h1>
            <button className="p-2 -mr-2">
              <Bell className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cycle Icon and Day Info Card */}
        <Card className="mb-6 border-0 shadow-none">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <img src="/Vector (14)-Photoroom.png" alt="Cycle icon" className="w-12 h-12 object-contain" />
            </div>

            <h2 className="text-4xl font-bold mb-2">Day {currentDay}</h2>
            <p className="text-lg mb-1 font-semibold" style={{ color: '#1F2937' }}>{getPhase()}</p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{format(cycleDate, "dd MMM yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(), "hh:mm a")}</span>
              </div>
            </div>
            {nextPeriod && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Your next period is estimated in {nextPeriod.days}d
              </p>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="mb-6 border-0 shadow-none">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Key Metrics</h3>
            </div>

            <div className="divide-y divide-gray-200">
              {metrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div key={index} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <IconComponent />
                      <span className="text-sm">{metric.label}</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#1F2937' }}>{metric.value}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-200 mt-4"></div>
          </CardContent>
        </Card>

        {/* Symptoms List */}
        {symptoms.length > 0 && (
          <Card className="mb-6 border-0 shadow-none">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom: any, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {symptom.symptom_type || symptom.type}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {cycle.notes && (
          <Card className="mb-6 border-0 shadow-none">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <p className="text-sm text-muted-foreground">{cycle.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full border-[#2563EB] text-[#2563EB] font-semibold hover:bg-[#EFF6FF] active:bg-[#2563EB] active:text-white"
            onClick={() => navigate("/cycle-insight")}
          >
            View Insight
          </Button>
          <Button
            size="lg"
            className="w-full bg-[#2563EB] hover:bg-[#1d4ed8]"
            onClick={() => {
              toast({
                title: "AI Assistant",
                description: "AI Assistant feature coming soon!",
              });
            }}
          >
            <img src="/robot-Photoroom.png" alt="AI" className="w-5 h-5 mr-2" />
            Consult AI Assistant
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CycleDetails;
