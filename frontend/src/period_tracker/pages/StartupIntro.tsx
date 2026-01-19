import React from "react";
import { useNavigate } from "react-router-dom";

const StartupIntro: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen bg-white flex justify-center items-center p-5">
      <div className="relative z-10 w-full h-full flex justify-center items-center">
        
        {/* Desktop View */}
        <div className="hidden sm:flex justify-center items-center w-full h-full">
          <div className="bg-white/85 backdrop-blur-xl rounded-[24px] p-[50px_60px] max-w-[700px] w-full text-center shadow-lg border border-white/40 lg:max-w-[600px] lg:p-[40px_50px]">
            <div className="flex justify-center mb-6">
              <img
                src="/week2-assets/l1.png"
                alt="FitFare Logo"
                className="w-[70px] h-[70px]  object-cover sm:w-[60px] sm:h-[60px]"
              />
            </div>

            <p className="text-[50px] text-[#111] mb-20 leading-[1.6] font-medium lg:text-[23px] md:text-[22px] md:mb-6 sm:text-[19px] sm:mb-5 xs:text-[14px]">
              Hey, Mori! I'm FitFare AI, and today we'll guide you through
              setting up your cycle tracking.
            </p>

            <div className="flex flex-col gap-3 items-center">

              {/* FIXED DESKTOP BUTTON */}
              <button
                onClick={() => navigate("/setup-intro")}
                className="w-[240px] px-5 py-2.5 rounded-[10px] text-[15px] font-medium bg-[#2563EB] text-white 
                           shadow-[0_4px_10px_rgba(0,86,255,0.3)] flex justify-center items-center gap-2 
                           transition duration-200 hover:bg-[#2563EB]"
              >
                Yes, start
                <img src="/week2-assets/Vector (18).png" alt="Arrow" className="w-4 h-4 object-contain" />
              </button>

              <button className="w-[240px] px-5 py-2.5 rounded-[10px] text-[15px] font-medium border-2 border-[#2563EB] text-[#2563EB] 
                           bg-transparent flex justify-center items-center gap-2 transition duration-200 
                           hover:border-[#0056ff] hover:text-[#2563EB]">
                No, I'll set up manually
                <img src="/week2-assets/edit pencil (1).png" alt="Edit" className="w-4 h-4 object-contain" />
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-[240px] px-5 py-2.5 rounded-[10px] text-[15px] font-medium bg-[#FF383C] text-white 
                           flex justify-center items-center gap-2 transition duration-200 hover:bg-[#e63939]"
              >
                <img src="/week2-assets/chevron left (1).png" alt="Back" className="w-4 h-4 object-contain" />
                No, go back
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden flex flex-col justify-between h-full w-full">
          <div className="mt-6 px-4 sm:px-3 flex flex-col items-start pl-2">
            <img src="/week2-assets/l1.png" alt="FitFare Logo" className="w-14 h-14 object-contain mb-6" />
            <p className="text-[21px] font-regular text-black leading-snug ml-[-6px]">
              Hey, Mori! I'm Fitfare AI, and today we'll guide you through
              setting up your cycle tracking.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 mb-6 px-6">
            
            {/* FIXED MOBILE BUTTON */}
            <button
              onClick={() => navigate("/setup-intro")}
              className="w-[50%] py-3 rounded-lg text-[13px] font-medium bg-[#2563EB] text-white 
                         flex justify-center items-center gap-2 hover:bg-[#2563EB] transition"
            >
              Yes, start
              <img src="/week2-assets/Vector (18).png" alt="Arrow" className="w-4 h-4 object-contain" />
            </button>

      <button className="w-[70%] py-3 rounded-lg text-[14px] font-semibold border-[1px] border-[#3B6AFF] text-[#3B6AFF] 
                     bg-transparent flex justify-center items-center gap-2 hover:bg-[#E9EEFF] transition">
      No, I'll set up manually
      <img src="/week2-assets/edit pencil (1).png" alt="Edit" className="w-5 h-5 object-contain" />
    </button>
            <button
              onClick={() => navigate("/")}
              className="w-[50%] py-3 rounded-lg text-[13px] font-medium bg-[#FF383C] text-white 
                         flex justify-center items-center gap-2 hover:bg-[#E53E3E] transition"
            >
              <img src="/week2-assets/chevron left (1).png" alt="Back" className="w-5 h-5 object-contain" />
              No, go back
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default StartupIntro;
