import React, { useState } from "react";
import { IoClose, IoCheckmark } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function Treatments() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleSelect = (choice: string) => {
    setSelected(choice);
    if (choice === "no") {
      setTimeout(() => navigate("/period-start"), 300);
    } else if (choice === "yes") {
      setShowDialog(true);
    }
  };

  const closeDialog = () => setShowDialog(false);

  return (
    <div className="min-h-screen w-full bg-white flex justify-center items-center">
      <div className="hidden sm:flex flex-col items-center text-center px-6 py-12 bg-white w-[400px] rounded-3xl shadow-xl border border-gray-200 relative">
        <button
          onClick={() => navigate("/period/cycle")}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Go back"
        >
          <img src="/week2-assets/chevron left.png" alt="Back" className="w-5 h-5" />
        </button>
        <div className="flex justify-center mb-6">
          <img src="/week2-assets/l1.png" alt="logo" className="w-20 h-20 object-contain" />
        </div>

        <p className="text-[24px] md:text-[28px] font-regular text-black mb-20">
          Do you use any contraceptive methods or hormonal treatments?
        </p>

        <div className="flex flex-col gap-4 w-full max-w-[300px] mt-4">
          <button
            onClick={() => handleSelect("no")}
            className={`w-full py-3 rounded-xl flex justify-center items-center gap-2 text-[16px] font-medium border transition-all duration-300 ${
              selected === "no"
                ? "bg-[#3B6AFF] text-white border-[#3B6AFF]"
                : "border-[#3B6AFF] text-[#3B6AFF] hover:bg-[#3B6AFF] hover:text-white"
            }`}
          >
            No <IoClose className="text-[20px]" />
          </button>

          <button
            onClick={() => handleSelect("yes")}
            className={`w-full py-3 rounded-xl flex justify-center items-center gap-2 text-[16px] font-medium border transition-all duration-300 ${
              selected === "yes"
                ? "bg-[#3B6AFF] text-white border-[#3B6AFF]"
                : "border-[#3B6AFF] text-[#3B6AFF] hover:bg-[#3B6AFF] hover:text-white"
            }`}
          >
            Yes <IoCheckmark className="text-[20px]" />
          </button>
        </div>
      </div>

      <div className="sm:hidden flex flex-col h-screen w-full bg-white relative overflow-y-auto">
        <div className="flex items-center gap-2 w-full pt-6 pl-6">
          <button
            onClick={() => navigate("/period/cycle")}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Go back"
          >
            <img src="/week2-assets/chevron left.png" alt="Back" className="w-5 h-5" />
          </button>
          <img src="/week2-assets/l1.png" alt="logo" className="w-14 h-13 object-contain" />
        </div>

       <div className="px-7 mt-7 ml-[-6px] sm:ml-0">
          <p className="text-[22px] font-regular text-black leading-snug">
            Do you use any contraceptive methods or hormonal treatments?
          </p>
        </div>

      <div className="absolute bottom-12 right-5 flex flex-col items-end gap-3 transform-gpu">
         <button
           onClick={() => handleSelect("no")}
           className={`w-[120px] py-3 rounded-xl text-[16px] font-medium border transition-colors duration-200 flex items-center gap-2 justify-center ${
             selected === "no"
               ? "bg-[#3B6AFF] text-white border-[#3B6AFF]"
               : "border-[#3B6AFF] text-[#3B6AFF] hover:bg-[#3B6AFF] hover:text-white"
           }`}
         >
           No
           <IoClose className="text-[24px]" />
         </button>
     
         <button
           onClick={() => handleSelect("yes")}
           className={`w-[120px] py-3 rounded-xl text-[16px] font-medium border transition-colors duration-200 flex items-center gap-2 justify-center ${
             selected === "yes"
               ? "bg-[#3B6AFF] text-white border-[#3B6AFF]"
               : "border-[#3B6AFF] text-[#3B6AFF] hover:bg-[#3B6AFF] hover:text-white"
           }`}
         >
           Yes
           <IoCheckmark className="text-[24px]" />
         </button>
       </div>
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-white bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-[350px] p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Important Information</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You indicated that you use <span className="font-semibold">contraceptive or hormonal treatments</span>.
              This can affect your cycle tracking results. Please review your details with a healthcare professional
              before continuing.
            </p>
            <div className="flex justify-center">
            <button
              onClick={() => navigate("/period/period-start")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              OK
            </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

