import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SnackFrequency.css";
import { RiErrorWarningLine } from "react-icons/ri";
import { useNutritionProfile } from "../../context/NutritionProfileContext";

export default function SnackFrequency() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { profile, updateProfile } = useNutritionProfile();
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    updateProfile({ snack_frequency: selectedOption });
  }, [selectedOption, updateProfile]);

  const options = [
    "One Time",
    "Two Times",
    "Three Times",
    "Four Times",
    "Five Times",
    "Six Times",
    "More",
  ];

  const handleContinue = () => {
    if (selectedOption) {
      navigate("/nutrition/calorie-intake");
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="snack-page">
      <div className="snack-card">
        <button
          onClick={() => navigate("/nutrition/allergies")}
          className="absolute top-4 left-4 p-2 hover:opacity-70 transition z-20"
          aria-label="Go back"
        >
          <img src="/chevron left (2).png" alt="Back" className="w-5 h-5" style={{ filter: 'brightness(0)' }} />
        </button>
        {/* ---------- Logo in center above heading ---------- */}
        <div className="snack-logo-container">
          <img src="/logo.png" alt="Logo" className="snack-logo" />
        </div>

        <h2 className="heading">How often do you snack daily ?</h2>

        {/* ---------- Scrollable Options ---------- */}
        <div className="options-scroll">
          {options.map((opt, idx) => {
            const selectedIndex = options.indexOf(selectedOption);
            const distance = Math.abs(selectedIndex - idx);

            let className = "option";
            if (selectedOption === opt) className += " selected";
            if (distance === 1) className += " nearby";
            if (distance === 2) className += " faded";
            if (distance >= 3) className += " more-faded";

            return (
              <div
                key={idx}
                className={className}
                onClick={() => setSelectedOption(opt)}
              >
                {opt}
              </div>
            );
          })}
        </div>

        <button className="continue-btn3" onClick={handleContinue}>
          Continue <FaArrowRight />
        </button>
      </div>

      {/* ---------- Modal ---------- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">
                You must select your snack frequency before continuing.
              </h3>
            </div>

            <button className="modal-btn" onClick={() => setShowModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}