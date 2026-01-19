import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Allergies.css";
import { RiErrorWarningLine } from "react-icons/ri";
import { FaArrowRight } from "react-icons/fa";
import { useNutritionProfile } from "../../context/NutritionProfileContext";

const Allergies = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useNutritionProfile();
  const [selected, setSelected] = useState<string[]>(profile.common_allergies || []);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    updateProfile({ common_allergies: selected });
  }, [selected, updateProfile]);

  // ✅ Replace icons with images from public folder
  const options = [
    { name: "Gluten", icon: "/bread toast.png" },
    { name: "Wheat", icon: "/wheat.png" },
    { name: "Lactose", icon: "/water drop.png" },
    { name: "Milk", icon: "/water glass.png" },
    { name: "Egg", icon: "/egg whole.png" },
    { name: "Shellfish", icon: "/fish (1).png" },
    { name: "Other", icon: "/gear.png" },
    { name: "None", icon: "/Vector (3).png" },
  ];

  const toggleSelect = (item: string) => {
    if (item === "None") {
      setSelected(["None"]);
    } else {
      setSelected((prev) => {
        const newSelection = prev.includes(item)
          ? prev.filter((i) => i !== item)
          : [...prev.filter((i) => i !== "None"), item];
        return newSelection;
      });
    }
  };

  const handleContinue = () => {
    if (selected.length === 0) {
      setShowModal(true);
    } else {
      navigate("/nutrition/snack-frequency");
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="allergy-container">
      <div className="allergy-card">
        <button
          onClick={() => navigate("/nutrition/food-preferences")}
          className="absolute top-4 left-4 p-2 hover:opacity-70 transition z-20"
          aria-label="Go back"
        >
          <img src="/chevron left (2).png" alt="Back" className="w-5 h-5" style={{ filter: 'brightness(0)' }} />
        </button>
        {/* ✅ Logo at the top */}
        <img src="/logo.png" alt="FitFare Logo" className="allergy-logo" />

        <h2>Do you have any allergies or intolerances?</h2>

        <div className="chips-container">
          {options.map((item) => (
            <div
              key={item.name}
              className={`chip ${
                selected.includes(item.name) ? "selected" : ""
              }`}
              onClick={() => toggleSelect(item.name)}
            >
              <span className="chip-icon">
                <img src={item.icon} alt={item.name} className="chip-img" />
              </span>
              {item.name}
            </div>
          ))}
        </div>

      

        <div className="note">
          <img src="/info circle.png" alt="info" className="note-img" />
          You can select multiple options
        </div>

        
        <button className="continue-button mt-10 continue-btn3" onClick={handleContinue}>
          Continue <FaArrowRight />
        </button>
        
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              
              <h3 className="modal-title">
                You must choose at least one allergy before continuing.
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

export default Allergies;


