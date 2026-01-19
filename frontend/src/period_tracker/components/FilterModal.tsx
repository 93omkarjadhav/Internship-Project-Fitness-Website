import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Calendar, Droplet, Activity, RotateCcw, ChevronDown } from "lucide-react";
import "../styles/filter-modal.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";

export interface FilterCriteria {
  flowType?: string;
  phase?: string;
  cycleLength?: string | null;
  symptom?: string;
}

interface FilterModalProps {
  onClose: () => void;
  onApplyFilters?: (filters: FilterCriteria) => void;
  initialFilters?: FilterCriteria;
}

interface PageData {
  id: string;
  title: string;
}

export const FilterModal = ({ onClose, onApplyFilters, initialFilters }: FilterModalProps) => {
  const navigate = useNavigate();

  // State for all filter options
  const [flowType, setFlowType] = useState(initialFilters?.flowType || "medium");
  const [type, setType] = useState(initialFilters?.phase || "menstruation");
  const [cycleLength, setCycleLength] = useState<string | null>(initialFilters?.cycleLength || null);
  const [proteinValue, setProteinValue] = useState([350]);
  const [symptom, setSymptom] = useState(initialFilters?.symptom || "headache");

  // Stacked cards state
  const [pages, setPages] = useState<PageData[]>([
    { id: '1', title: 'History Log' },
    { id: '2', title: 'Daily Analytics' },
    { id: '3', title: 'Filter Cycle History' },
  ]);

  const handleAddMeal = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Meal tracking feature will be available soon!",
    });
    // Navigate to log cycle for now
    onClose();
    navigate("/log-cycle");
  };

  const handleApplyFilters = () => {
    const filters: FilterCriteria = {
      flowType,
      phase: type,
      cycleLength,
      symptom,
    };
    
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    
    toast({
      title: "Filters Applied",
      description: `Flow: ${flowType}, Phase: ${type}, Length: ${cycleLength || 'Any'}`,
    });
    onClose();
  };

  const [isApplyFiltersClicked, setIsApplyFiltersClicked] = useState(false);

  const handleKeyDown = (event: React.KeyboardEvent, optionValue: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setCycleLength(cycleLength === optionValue ? null : optionValue);
    }
  };

  const handleCloseStack = () => {
    if (pages.length > 1) {
      setPages((prev) => prev.slice(0, -1));
    } else {
      onClose();
    }
  };

  const handleReset = () => {
    setPages([
      { id: '1', title: 'History Log' },
      { id: '2', title: 'Daily Analytics' },
      { id: '3', title: 'Filter Cycle History' },
    ]);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}>
      
      {/* Stacked Cards Container */}
      <div className="relative w-full sm:w-[375px] h-[85vh] max-h-[700px] flex justify-center">
        
        {/* Reset State UI */}
        {pages.length === 0 && (
          <div className="absolute top-1/2 transform -translate-y-1/2 flex flex-col items-center z-0">
            <p className="text-slate-600 font-medium mb-4">All cards cleared</p>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition"
            >
              <RotateCcw className="w-4 h-4" /> Reset Stack
            </button>
          </div>
        )}

        {pages.map((page, index) => {
          const indexFromFront = pages.length - 1 - index;
          
          // Stack Logic
          const topOffset = 40 - (indexFromFront * 20); 
          const scale = 1 - (indexFromFront * 0.05);
          const opacity = indexFromFront === 0 ? 1 : 0.6 + (0.1 * (2 - indexFromFront));
          const zIndex = 50 - indexFromFront;
          
          if (indexFromFront > 2) return null;

          return (
            <div
              key={page.id}
              className="absolute w-full h-full transition-all duration-500"
              style={{
                zIndex: zIndex,
                top: `${topOffset}px`,
                transform: `scale(${scale})`,
                opacity: opacity,
                transformOrigin: 'top center',
                transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div 
                className={`w-full h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/50 ${indexFromFront > 0 ? 'bg-slate-50' : ''}`}
              >
                {/* Visual Handle */}
                <div className="w-full flex justify-center pt-4 pb-2 shrink-0 opacity-50">
                  <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                </div>

                {/* Content - Only for Top Card */}
                {indexFromFront === 0 ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Fixed Header */}
                    <div className="px-6 pb-4 flex items-start justify-between shrink-0 border-b border-border">
                      <div>
                        <h1 className="text-xl font-semibold">Filter Cycle History</h1>
                        <p className="text-sm text-muted-foreground mt-1">Quickly find and analyze your meal data</p>
                      </div>
                      <button onClick={handleCloseStack} className="p-1 rounded-full hover:bg-slate-100 transition">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="px-6 overflow-y-auto pb-10 space-y-6 pt-6">
                      
                      {/* Flow Type */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Flow Type</label>
                        <div className="relative hide-select-icon">
                          <Select value={flowType} onValueChange={setFlowType}>
                            <SelectTrigger className="w-full pl-10 pr-10 [&>svg]:hidden">
                              <SelectValue placeholder="Select flow type" />
                            </SelectTrigger>
                            <SelectContent className="z-[99999]">
                              <SelectItem value="spotting">Spotting</SelectItem>
                              <SelectItem value="light">Light Flow</SelectItem>
                              <SelectItem value="medium">Medium Flow</SelectItem>
                              <SelectItem value="heavy">Heavy Flow</SelectItem>
                            </SelectContent>
                          </Select>
                          <img src="/calendar.png" alt="" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                          <img src="/chevron down (1).png" alt="" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 z-10" />
                        </div>
                      </div>

                      {/* Phase */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Phase</label>
                        <div className="relative hide-select-icon">
                          <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-full pl-10 pr-10 [&>svg]:hidden">
                              <SelectValue placeholder="Select phase" />
                            </SelectTrigger>
                            <SelectContent className="z-[99999]">
                              <SelectItem value="menstruation">Menstruation</SelectItem>
                              <SelectItem value="follicular">Follicular Phase</SelectItem>
                              <SelectItem value="ovulation">Ovulation</SelectItem>
                              <SelectItem value="luteal">Luteal Phase</SelectItem>
                            </SelectContent>
                          </Select>
                          <img src="/calendar.png" alt="" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                          <img src="/chevron down (1).png" alt="" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 z-10" />
                        </div>
                      </div>

                      {/* Cycle Length */}
                      <div>
                        <label className="text-sm font-medium mb-3 block">Cycle Length</label>
                        <div className="cycle-length-container scrollbar-hide" role="radiogroup" aria-label="Cycle length options">
                          {[
                            { value: "<25 days", label: "<25 days" },
                            { value: "25-35 days", label: "25-35 days" },
                            { value: ">35 days", label: ">35 days" }
                          ].map((option) => {
                            const isSelected = cycleLength === option.value;
                            return (
                              <button
                                key={option.value}
                                onClick={() => setCycleLength(isSelected ? null : option.value)}
                                onKeyDown={(e) => handleKeyDown(e, option.value)}
                                className={`cycle-length-button px-4 py-2 rounded-lg border transition-colors text-sm whitespace-nowrap flex-shrink-0 ${isSelected
                                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
                                    : "bg-background border-border text-foreground hover:bg-secondary/50"
                                  }`}
                                role="radio"
                                aria-checked={isSelected}
                                aria-label={`Cycle length: ${option.label}`}
                                tabIndex={0}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Filter by Symptom */}
                      <div>
                        <label className="text-sm font-bold mb-2 block">Filter by Symptom</label>
                        <div className="relative hide-select-icon">
                          <Select value={symptom} onValueChange={setSymptom}>
                            <SelectTrigger className="w-full border-2 pr-10 [&>svg]:hidden">
                              <SelectValue placeholder="Select symptom" />
                            </SelectTrigger>
                            <SelectContent className="z-[99999]">
                              <SelectItem value="headache">
                                <div className="flex items-center gap-2">
                                  <img src="/Vector (2).png" alt="Headache" className="w-4 h-4" />
                                  <span>Headache</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="cramps">
                                <div className="flex items-center gap-2">
                                  <img src="/cramps-Photoroom.png" alt="Cramps" className="w-4 h-4" />
                                  <span>Cramps</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="fatigue">
                                <div className="flex items-center gap-2">
                                  <img src="/fatigue-Photoroom.png" alt="Fatigue" className="w-4 h-4" />
                                  <span>Fatigue</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="insomnia">
                                <div className="flex items-center gap-2">
                                  <img src="/insomnia-Photoroom.png" alt="Insomnia" className="w-4 h-4" />
                                  <span>Insomnia</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="bloating">Bloating</SelectItem>
                            </SelectContent>
                          </Select>
                          <img src="/chevron down (1).png" alt="" className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 z-10" />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 pt-4">
                        <Button
                          className={`w-full transition-colors ${isApplyFiltersClicked
                              ? "bg-[#2563EB] hover:bg-[#2563EB]/90 text-white"
                              : "bg-white border-2 border-border text-foreground hover:bg-secondary/50"
                            }`}
                          size="lg"
                          onClick={() => {
                            setIsApplyFiltersClicked(true);
                            handleApplyFilters();
                          }}
                        >
                          Apply Filters
                        </Button>

                        {/* Add Meal Button */}
                        <Button
                          className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90"
                          size="lg"
                          onClick={handleAddMeal}
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add Meal
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Background Card Placeholder
                  <div className="px-6 pt-2 opacity-50">
                    <div className="h-6 w-1/3 bg-slate-400/30 rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-slate-300/30 rounded"></div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
