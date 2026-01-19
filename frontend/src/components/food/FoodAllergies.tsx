import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiLightbulbFlashLine } from "react-icons/ri"; // ⚡ Modern lightbulb icon
import "./FoodAllergies.css";
import { RiErrorWarningLine } from "react-icons/ri";
import { FaArrowRight } from "react-icons/fa";
import { useNutritionProfile } from "../../context/NutritionProfileContext";

const FoodAllergies = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { profile, updateProfile } = useNutritionProfile();
  const [allergies, setAllergies] = useState(profile.other_notes || "");

  useEffect(() => {
    updateProfile({ other_notes: allergies });
  }, [allergies, updateProfile]);

  const handleContinue = () => {
    if (allergies.trim()) {
      navigate("/dashboard");
    } else {
      setShowModal(true);
    }
  };

  const closeModal = () => setShowModal(false);

  return (
    <div className="allergy-page">
      <div className="allergy-card">
        <button
          onClick={() => navigate("/nutrition/calorie-intake")}
          className="absolute top-4 left-4 p-2 hover:opacity-70 transition z-20"
          aria-label="Go back"
        >
          <img src="/chevron left (2).png" alt="Back" className="w-5 h-5" style={{ filter: 'brightness(0)' }} />
        </button>
        {/* ---------- Center Logo in Card ---------- */}
        <div className="foodallergy-logo-center">
          <img src="/logo.png" alt="Logo" />
        </div>

        <h2 className="allergy-heading">
          Do you have any food allergies or other notes?
        </h2>

        <textarea
          className="allergy-input"
          placeholder="Type here about your allergies..."
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
        />

        {/* ---------- Tip Box ---------- */}
        <div className="tip-box">
          <RiLightbulbFlashLine className="tip-icon" />
          <p>
            You can include lifestyle notes like "Avoid fried food" or "Prefer
            high-protein meals."
          </p>
        </div>

        <button className="continue-button continue-btn3" onClick={handleContinue}>
          Continue <FaArrowRight />
        </button>
      </div>

      {/* ---------- Modal ---------- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
           
              <h3 className="modal-title">
                Mention your allergies or dietary notes before continuing.
              </h3>
            </div>

            <button className="modal-btn" onClick={closeModal}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodAllergies;

