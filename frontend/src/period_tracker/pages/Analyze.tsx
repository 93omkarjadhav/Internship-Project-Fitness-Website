import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Analyzing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { lastPeriodDate?: string; symptoms?: string[] };

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/period/next-period", {
        state: {
          lastPeriodDate: state?.lastPeriodDate,
          symptoms: state?.symptoms,
        },
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, state]);

  return (
    <div className="min-h-screen w-full bg-white-50 flex justify-center items-start sm:items-center pt-10 sm:pt-0">
      <div className="bg-white w-full sm:w-[430px] sm:rounded-3xl sm:shadow-xl sm:border sm:border-white
          flex flex-col items-center text-center px-6 py-10 sm:py-16 relative transition-all duration-300">

        {/* Logo Section */}
        <div
          className="
            absolute top-2 left-8
            sm:static sm:mt-4 sm:mb-6 sm:flex sm:justify-center
          "
        >
          <img
            src="/week2-assets/l1.png"
            alt="logo"
            className="w-14 h-14 sm:w-20 sm:h-20 object-contain"
          />
        </div>

        <div className="flex flex-col justify-center items-start w-full mt-12 sm:mt-18 ml-[-6]">
          <p className="text-[24px] sm:text-[28px] md:text-[28px] font-regular text-gray-800">
            Analyzing...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analyzing;
