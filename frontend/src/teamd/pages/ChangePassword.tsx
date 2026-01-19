import React, { useState } from "react";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { changePassword } from "../api/api";
import { useNavigate } from "react-router-dom";
import { teamDPath } from "../constants";
import Checkbox_Only from "../assets/ChangePassword/Checkbox Only.png";
import Cross_Only from "../assets/ChangePassword/Cross_Only.png";
import LockNonBg from "../assets/ChangePassword/LockNonBg.png";
import LockIcon from "../assets/ChangePassword/lock.png";
import { ArrowLeft } from "lucide-react";

interface Validations {
  length: boolean;
  upperLower: boolean;
  number: boolean;
  special: boolean;
  common: boolean;
}

interface Message {
  type: "success" | "error";
  text: string;
}

const ChangePassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validations, setValidations] = useState<Validations>({
    length: false,
    upperLower: false,
    number: false,
    special: false,
    common: false,
  });
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (value: string) => {
    setPassword(value);
    setValidations({
      length: value.length >= 8,
      upperLower: /(?=.*[a-z])(?=.*[A-Z])/.test(value),
      number: /(?=.*\d)/.test(value),
      special: /(?=.*[!@#$%^&*])/.test(value),
      common: !["password", "12345678", "qwerty"].includes(value.toLowerCase()),
    });
  };

  const isAllValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllValid) return;

    setLoading(true);
    setMessage(null);

    try {
      await changePassword({ password });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPassword("");
      setTimeout(() => navigate(teamDPath("settings")), 2000);
    } catch {
      setMessage({ type: "error", text: "Error changing password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-800 px-4">
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-md text-center">

        {/* Back Arrow */}
        <button
          onClick={() => navigate(teamDPath("settings"))}
          className="absolute top-5 left-5 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
        </button>

        {/* Lock Icon */}
        <div className="mx-auto w-14 h-14 bg-blue-50/30 dark:bg-transparent rounded-full flex items-center justify-center mb-3">
          <img src={LockIcon} alt="Lock" className="w-6 h-6 dark:invert" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Change password
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-sm mt-1 mb-6">
          Change your password in here.
        </p>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <img
              src={LockNonBg}
              className="absolute left-3 top-3 w-4 h-4 opacity-60 dark:invert"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password..."
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl pl-10 pr-10 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>

          {/* Validations */}
          {password && (
            <ul className="text-left text-sm space-y-2 mb-6">
              {[
                ["Must be at least 8 characters", validations.length],
                ["One uppercase and lowercase letter", validations.upperLower],
                ["One number", validations.number],
                ["One special character", validations.special],
                ["Must not be common", validations.common],
              ].map(([text, valid], i) => (
                <li key={i} className="flex items-center gap-2">
                  <img
                    src={valid ? Checkbox_Only : Cross_Only}
                    className="w-4 h-4 dark:invert"
                  />
                  <span
                    className={valid ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button
            type="submit"
            disabled={!isAllValid || loading}
            className={`w-full py-2 rounded-xl font-medium text-white transition active:scale-95 ${
              isAllValid && !loading
                ? "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
                : "bg-blue-200 dark:bg-gray-600 cursor-not-allowed"
            }`}
          >
            {loading ? "Saving..." : "Change Password →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
