import React from "react";
import { useNavigate } from "react-router-dom";
import Frame from "../../assets/SetPasscode/Frame.png";
import { teamDPath } from "../../constants";
import { ArrowLeft } from "lucide-react";

const PasscodeProtection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-800"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Back Arrow (ONLY ADDITION) */}
      <button
        onClick={() => navigate(teamDPath("settings"))}
        className="absolute top-5 left-5 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition active:scale-95"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
      </button>

      <img
        src={Frame}
        alt="Passcode Protection"
        className="w-60 h-60 max-w-full object-contain dark:opacity-90"
      />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6">
        Passcode Protection
      </h1>

      <p className="text-gray-500 dark:text-gray-300 text-center mt-2 max-w-sm">
        Add an extra layer of security with passcode protection.
      </p>

      <button
        onClick={() => navigate(teamDPath("set-passcode"))}
        className="mt-8 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-8 py-3 rounded-xl text-lg font-semibold transition w-full sm:w-auto active:scale-95"
      >
        Set Up Passcode →
      </button>
    </div>
  );
};

export default PasscodeProtection;
