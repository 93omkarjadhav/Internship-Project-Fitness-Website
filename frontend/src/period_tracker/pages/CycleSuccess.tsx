import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CycleSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#5B6B7D] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 mb-6 shadow-2xl">
          
          {/* Illustration */}
          <div className="mb-6">
            <div className="w-full aspect-[4/3] bg-[#E8EEF4] rounded-3xl flex items-center justify-center overflow-hidden">
              <img 
                src="/success-illustration.jpg" 
                alt="Cycle logged successfully" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
            Cycle logged!
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Congratulations! You've successfully logged your cycle today.
          </p>

          {/* Button */}
          <button 
            onClick={() => navigate("/period/cycle-history", { state: { from: "/dashboard" } })}
            className="w-full bg-[#2563EB] hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-primary-foreground">Great, thanks</span>

            {/* FIXED IMAGE HERE */}
            <img 
              src="/check single (3).png"
              alt="Check"
              className="w-5 h-5 object-contain"
            />
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={() => navigate("/period/cycle-history", { state: { from: "/dashboard" } })}
          className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default CycleSuccess;
