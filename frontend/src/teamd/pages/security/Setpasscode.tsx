import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import passcodeImage from "../../assets/passcodeImg.jpg";
import { setPasscodee } from "../../api/api";
import { teamDPath } from "../../constants";
import { ArrowLeft } from "lucide-react";

const PasscodeProtection: React.FC = () => {
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Submit handler
  const handleSubmit = useCallback(async (): Promise<void> => {
    if (passcode.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      await setPasscodee({ passcode });
      alert("Passcode set successfully!");
      navigate(teamDPath("security-settings"));
    } catch (err) {
      console.error("Error setting passcode:", err);
      setError("Error setting passcode. Please try again.");
      setLoading(false);
    }
  }, [passcode, navigate]);

  // Handle keyboard number input (0–9)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9" && passcode.length < 6) {
        setPasscode((prev) => prev + e.key);
      } else if (e.key === "Backspace") {
        setPasscode((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter" && passcode.length === 6) {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [passcode, handleSubmit]);

  // Handle on-screen keypad input
  const handleButtonClick = (value: string | number): void => {
    if (value === "del") {
      setPasscode((prev) => prev.slice(0, -1));
    } else if (passcode.length < 6) {
      setPasscode((prev) => prev + value);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-800"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Back Arrow (ONLY ADDITION) */}
      <button
        onClick={() => navigate(teamDPath("passcode-protection"))}
        className="absolute top-5 left-5 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition active:scale-95"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
      </button>

      <img
        src={passcodeImage}
        alt="Passcode Protection"
        className="w-60 h-60 max-w-full object-contain dark:opacity-90"
      />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6">
        Passcode Protection
      </h1>

      <p className="text-gray-500 dark:text-gray-300 text-center mt-2 max-w-sm">
        Add an extra layer of security with passcode protection.
      </p>

      {/* Passcode Dots */}
      <div className="flex gap-3 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${
              passcode[i]
                ? "bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          ></div>
        ))}
      </div>

      {/* Numeric Keypad (Keyboard only) */}
      {/* <div className="grid grid-cols-3 gap-4 mt-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "del"].map((value, index) => (
          <button
            key={index}
            onClick={() => value && handleButtonClick(value)}
            disabled={loading}
            className={`w-16 h-16 rounded-full text-xl font-semibold ${
              value === "del"
                ? "bg-red-100 text-red-600"
                : "bg-white shadow-md hover:bg-blue-50"
            } transition`}
          >
            {value === "del" ? "⌫" : value}
          </button>
        ))}
      </div> */}

      <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 text-center">
        Use your keyboard to enter digits 0-9
      </p>

      <button
        onClick={handleSubmit}
        disabled={passcode.length < 6 || loading}
        className={`mt-8 px-8 py-3 rounded-xl text-lg font-semibold transition active:scale-95
          w-[280px] sm:w-[300px] mx-auto block ${
            passcode.length === 6 && !loading
              ? "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
              : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
          }`}
      >
        Continue →
      </button>
    </div>
  );
};

export default PasscodeProtection;
