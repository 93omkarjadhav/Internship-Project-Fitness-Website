import { useState } from "react";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SuccessModal } from "@/components/SuccessModal";
import { cycleAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const LogCycle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedIntensity, setSelectedIntensity] = useState<string>(""); // kept for compatibility, no longer required
  const [fluidType, setFluidType] = useState<string>("egg-white");
  const [periodStartDate, setPeriodStartDate] = useState<string>("");
  const [periodEndDate, setPeriodEndDate] = useState<string>("");
  const [notes, setNotes] = useState("");

  const symptoms = [
    { id: "cramps", label: "Cramps" },
    { id: "insomnia", label: "Insomnia" },
    { id: "tender-breast", label: "Tender Breast" },
    { id: "acne", label: "Acne" },
    { id: "fatigue", label: "Fatigue" },
    { id: "backache", label: "Backache" },
    { id: "cravings", label: "Cravings" },
    { id: "itching", label: "Itching" },
  ];

  const intensityOptions = [
    { id: "spotting", label: "Spotting" },
    { id: "light", label: "Light" },
    { id: "medium", label: "Medium" },
    { id: "heavy", label: "Heavy" },
  ];

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!periodStartDate) {
      toast({
        title: "Validation Error",
        description: "Please select a period start date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
     // Calculate cycle length if end date is provided
      let cycleLength = null;
      let periodLength = null;
      
      if (periodEndDate && periodStartDate) {
        const start = new Date(periodStartDate);
        const end = new Date(periodEndDate);
        const diffTime = end.getTime() - start.getTime();
        periodLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Days between dates + 1
      }

      // Format dates for API
      const cycleData = {
        period_start_date: periodStartDate,
        period_end_date: periodEndDate || null,
        flow_intensity: null,
        fluid_type: null,
        notes: notes || null,
        cycle_length: cycleLength,
        period_length: periodLength,
        symptoms: [], // no symptoms collected on this screen now
      };

      // Save to database
      const response = await cycleAPI.create(cycleData);

      toast({
        title: "Success!",
        description: "Cycle logged successfully",
      });

      setShowSuccess(true);

      // Reset form (navigation handled by success modal)
      setPeriodStartDate("");
      setPeriodEndDate("");
      setSelectedSymptoms([]);
      setSelectedIntensity("");
      setFluidType("egg-white");
      setNotes("");
    } catch (error: any) {
      console.error("Error logging cycle:", error);
      let errorMessage = "Failed to log cycle. Please try again.";
      
      if (error?.error) {
        errorMessage = error.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Check if it's a network error
      if (errorMessage.includes('Network Error') || errorMessage.includes('Cannot connect') || errorMessage.includes('ECONNREFUSED')) {
        errorMessage = "Cannot connect to backend. Please make sure the backend server is running on port 5000.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const noteCharCount = notes.length;
  const maxChars = 300;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b border-border flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2"
            >
              <img src="/backarrow.png" alt="Back" className="w-6 h-6 object-contain" />
            </button>
            <h1 className="text-lg font-semibold">Log Cycle</h1>
            <button className="p-2 -mr-2">
              <img src="/bell-Photoroom.png" alt="Notifications" className="w-6 h-6 object-contain" />
            </button>
          </div>
        </div>
      </div>

      {/* Form Content - Desktop: Split Left/Right, Mobile: Single Column */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full pb-32 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Side - Dates & Note (Desktop) / All fields in order (Mobile) */}
          <div className="space-y-6 lg:space-y-6">
            {/* Period Start Date */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700">
                Period Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm hover:bg-white focus:bg-white active:bg-white focus:outline-none focus:ring-0"
                  >
                    <span className="flex flex-col items-start text-gray-700">
                      <span>
                        {periodStartDate
                          ? format(new Date(periodStartDate), "dd MMM yyyy")
                          : "Select start date"}
                      </span>
                      {periodStartDate && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(periodStartDate), "MMMM yyyy")}
                        </span>
                      )}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-[#2563EB]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={periodStartDate ? new Date(periodStartDate) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      const value = format(date, "yyyy-MM-dd");
                      setPeriodStartDate(value);
                      // If end date is before start, reset it
                      if (periodEndDate && new Date(periodEndDate) < date) {
                        setPeriodEndDate(value);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Period End Date */}
            <div>
              <label className="text-sm font-semibold mb-2 block text-gray-700">
                Period End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm hover:bg-white focus:bg-white active:bg-white focus:outline-none focus:ring-0"
                  >
                    <span className="flex flex-col items-start text-gray-700">
                      <span>
                        {periodEndDate
                          ? format(new Date(periodEndDate), "dd MMM yyyy")
                          : "Select end date"}
                      </span>
                      {periodEndDate && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(periodEndDate), "MMMM yyyy")}
                        </span>
                      )}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-[#2563EB]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={periodEndDate ? new Date(periodEndDate) : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      // Don't allow end before start
                      if (periodStartDate && date < new Date(periodStartDate)) return;
                      const value = format(date, "yyyy-MM-dd");
                      setPeriodEndDate(value);
                    }}
                    disabled={(date) =>
                      periodStartDate ? date < new Date(periodStartDate) : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Note */}
          <div className="relative">
  <label className="text-sm font-semibold mb-2 block text-gray-700">Note</label>

  <Textarea
    placeholder="Felt a bit of cramps on bottom area"
    className="min-h-[120px] resize-none pr-10"
    maxLength={maxChars}
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
  />

  {/* Text inside textarea at bottom-left */}
  <p
    className={`absolute bottom-2 left-2 text-xs ${
      noteCharCount >= maxChars ? "text-destructive" : "text-gray-500"
    }`}
  >
    {noteCharCount}/{maxChars}
  </p>
</div>

          </div>

        </div>
      </form>

      {/* Fixed Bottom Button - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 lg:hidden">
        <div className="max-w-7xl mx-auto">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white flex items-center justify-center rounded-xl" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? (
              <>Loading...</>
            ) : (
              <>
                Log Cycle
                
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop Submit Button */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <Button type="submit" size="lg" className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white flex items-center justify-end rounded-xl" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>Loading...</>
          ) : (
            <>
              Log Cycle
             
            </>
          )}
        </Button>
      </div>

      {showSuccess && (
        <SuccessModal
          onPrimary={() => {
            setShowSuccess(false);
            // After logging, go to cycle history
            navigate("/period/cycle-history");
          }}
          onClose={() => {
            setShowSuccess(false);
            // Cross -> back to Log Cycle page
            navigate("/period/log-cycle");
          }}
        />
      )}
    </div>
  );
};

export default LogCycle;
