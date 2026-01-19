import React, { useState } from "react";
import { IoArrowForward, IoCheckmark } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import { Stethoscope, HeartCrack, Brain, Scale, Droplet, Activity, Shapes } from "lucide-react";
import { symptomAPI } from "@/lib/api";

interface Condition {
  id: number;
  label: string;
  type: "icon" | "image";
  reactIcon?: JSX.Element;
  icon?: string;
}

const conditions: Condition[] = [
  { id: 101, label: "PCOS / PCOD", type: "icon", reactIcon: <Stethoscope size={20} /> },
  { id: 102, label: "Stress", type: "icon", reactIcon: <Brain size={20} /> },
  { id: 103, label: "Endometriosis", type: "icon", reactIcon: <HeartCrack size={20} /> },
  { id: 104, label: "Obesity", type: "icon", reactIcon: <Scale size={20} /> },
  { id: 105, label: "Anemia (iron deficiency)", type: "icon", reactIcon: <Droplet size={20} /> },
  { id: 106, label: "PMS", type: "icon", reactIcon: <Activity size={20} /> },
  { id: 107, label: "Other", type: "icon", reactIcon: <Shapes size={20} /> },
];

interface LocationState {
  lastPeriodDate?: string;
  existingSymptoms?: string[];
  fromDashboard?: boolean;
}

const SymptomSelector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  // Initialize selected based on existing symptoms if coming from dashboard
  const getInitialSelected = () => {
    if (state?.existingSymptoms && state.existingSymptoms.length > 0) {
      return conditions
        .filter(c => state.existingSymptoms!.includes(c.label))
        .map(c => c.id);
    }
    return [];
  };

  const [selected, setSelected] = useState<number[]>(getInitialSelected());
  const [showModal, setShowModal] = useState(false);

  const toggleCondition = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSkip = () => {
    setSelected([]);
    const dashboardData = JSON.parse(localStorage.getItem("mori_dashboard") || "{}");
    dashboardData.symptoms = [];
    dashboardData.lastPeriodDate = state?.lastPeriodDate || dashboardData.lastPeriodDate;
    localStorage.setItem("mori_dashboard", JSON.stringify(dashboardData));

    // Navigate to analyzing page (shows loader then Next Period)
    navigate("/period/analyzing", {
      state: { lastPeriodDate: state?.lastPeriodDate, symptoms: [] },
    });
  };

  const handleStart = () => {
    if (selected.length === 0) return setShowModal(true);

    const chosen = conditions
      .filter((s) => selected.includes(s.id))
      .map((s) => s.label);

    const dashboardData = JSON.parse(localStorage.getItem("mori_dashboard") || "{}");
    dashboardData.symptoms = chosen;
    dashboardData.lastPeriodDate = state?.lastPeriodDate || dashboardData.lastPeriodDate;
    localStorage.setItem("mori_dashboard", JSON.stringify(dashboardData));

    (async () => {
      try {
        await symptomAPI.saveBulk({ selectedSymptoms: chosen, selectedDate: state?.lastPeriodDate });
      } catch (err) {
        console.error("Failed saving symptoms to backend", err);
      }
    })();

    // If coming from dashboard, navigate back to dashboard
    if (state?.fromDashboard) {
      navigate("/period/dashboard", {
        state: { symptoms: chosen },
      });
    } else {
      // Otherwise navigate to analyzing page, which then shows Next Period
      navigate("/period/analyzing", {
        state: { lastPeriodDate: state?.lastPeriodDate, symptoms: chosen },
      });
    }
  };

  const renderConditionButton = (item: Condition, isSelected: boolean, isOther: boolean = false) => (
    <button
      key={item.id}
      onClick={() => toggleCondition(item.id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border
        ${isSelected ? "border-blue-600 text-blue-600 bg-blue-50" : "border-gray-300 text-gray-600 bg-gray-50 hover:bg-gray-100"}
        ${isOther ? "col-span-2 justify-center w-full max-w-[120px] mx-auto" : ""}`}
    >
      {item.type === "image" ? (
        <img
          src={item.icon}
          className="w-5 h-5"
          style={isSelected ? { filter: "invert(36%) sepia(94%) saturate(6514%) hue-rotate(202deg)" } : {}}
        />
      ) : (
        <span className={isSelected ? "text-blue-600" : "text-gray-600"}>{item.reactIcon}</span>
      )}
      <span className={isOther ? "text-[14px] font-medium" : ""}>{item.label}</span>
    </button>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4 relative">
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-2xl text-center shadow-lg w-80">
            <p className="text-gray-700 text-[15px]">
              Please select at least one health condition, or click <strong>Skip</strong> if you don’t have any.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP VIEW */}
      <div className="hidden sm:flex bg-white rounded-2xl shadow-xl w-full max-w-md p-8 flex-col items-center relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Go back"
        >
          <img src="/week2-assets/chevron left.png" alt="Back" className="w-5 h-5" />
        </button>
        <img src="/week2-assets/l1.png" className="w-16 h-16 object-contain mb-8" />

        <h2 className="text-[25px] symptom-heading text-center mb-6">
          Are there any health conditions that you are experiencing right now?
        </h2>

        <p className="text-gray-600 text-left w-full mb-8 text-[14px] mt-4">
          Select the health conditions from below:
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-6 w-full">
          {conditions.map((item) => renderConditionButton(item, selected.includes(item.id), item.id === 107))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <img src="/week2-assets/info circle (1).png" alt="Info" className="w-6 h-6" />
          <span className="text-gray-500 text-sm">You can select multiple</span>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-[#2563EB] hover:bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition"
        >
          Yes, start <IoArrowForward className="text-[20px]" />
        </button>

        <button
          onClick={handleSkip}
          className="mt-4 w-full border border-[#3B6AFF] text-[#3B6AFF] py-3 rounded-xl hover:bg-[#3B6AFF] hover:text-white flex items-center justify-center gap-2 transition"
        >
          Skip <IoCheckmark className="text-[20px]" />
        </button>
      </div>

      {/* MOBILE VIEW */}
      <div className="sm:hidden flex flex-col min-h-screen bg-white px-6">
        <div className="flex items-center gap-2 w-full mt-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Go back"
          >
            <img src="/week2-assets/chevron left.png" alt="Back" className="w-5 h-5" />
          </button>
          <img src="/week2-assets/l1.png" className="w-14 h-14" />
        </div>

        <h2 className="text-[21px] symptom-heading">
          Are there any health condition(s) that you are experiencing right now?
        </h2>

        <p className="text-gray-600 mt-8 text-[14px]">Select the health conditions from below:</p>
        <div className="grid grid-cols-2 gap-3 mt-8">
          {conditions.map((item) =>
            renderConditionButton(item, selected.includes(item.id), item.id === 107)
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mb-4 mt-7">
          <img src="/week2-assets/info circle (1).png" alt="Info" className="w-5 h-5" />
          <span className="text-gray-500 text-[16px]">You can select multiple</span>
        </div>

        <div className="flex flex-col items-end mt-6 pb-6 gap-3 w-full">
          <button
            onClick={handleStart}
            className="bg-[#2563EB] text-white py-3 w-40 rounded-xl flex items-center justify-center gap-2 font-regular hover:bg-blue-600 transition"
          >
            Yes, start <IoArrowForward className="text-[20px] font-regular" />
          </button>

          <button
            onClick={handleSkip}
            className="w-40 border border-[#3B6AFF] text-[#3B6AFF] py-3 rounded-xl hover:bg-[#3B6AFF] hover:text-white flex items-center justify-center gap-2"
          >
            Skip <IoCheckmark className="text-[22px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymptomSelector;
