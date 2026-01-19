import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { useNutritionProfile } from "@/context/NutritionProfileContext";

import "./FoodPreferences.css";

const FoodPreferences = () => {
  const [selected, setSelected] = useState("I don't have any preferences");
  const navigate = useNavigate();
  const { updateProfile } = useNutritionProfile();

  const options = [
    { label: "No preferences", icon: "/Vector (6).png" },
    { label: "Pescatarian", icon: "/fish (1).png" },
    { label: "Vegetarian", icon: "/leaf double (2).png" },
    { label: "Vegan", icon: "/leafs.png" },
    { label: "Non-Vegetarian", icon: "/Vector (5).png" },
    // { label: "", icon: "/wheat.png" },
  ];

  const handleContinue = () => {
    updateProfile({ food_preference: selected });
    navigate("/nutrition/allergies");
  };

  return (
    <div className="food-page">
      <div className="food-dialog-box">
        <button
          onClick={() => navigate("/nutrition/setup")}
          className="absolute top-4 left-4 p-2 hover:opacity-70 transition z-20"
          aria-label="Go back"
        >
          <img src="/chevron left (2).png" alt="Back" className="w-5 h-5" style={{ filter: 'brightness(0)' }} />
        </button>

        <img src="/logo.png" alt="FitFare Logo" className="food-logo" />

        <h2 className="heading mb-5">What are your food preferences?</h2>

        <div className="options">
          {options.map((item) => (
            <label
              key={item.label}
              className={`option ${selected === item.label ? "selected" : ""}`}
              onClick={() => setSelected(item.label)}
            >

              <div className="icon-box">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-6 h-6"
                  style={{
                    filter:
                      selected === item.label
                        ? "brightness(0) saturate(100%) invert(32%) sepia(94%) saturate(2013%) hue-rotate(194deg) brightness(98%) contrast(101%)"
                        : "none",
                  }}
                />

              </div>

              <span className="option-text">{item.label}</span>

              <div className="custom-radio">
                {selected === item.label && (
                  <img
                    src="/public/Checkbox.png"
                    alt="selected"
                    className=""
                  />
                )}
              </div>
            </label>
          ))}
        </div>

        <button className="continue-button continue-btn3 justify-center flex" onClick={handleContinue}>
          <p className=" gap-2">Continue</p><FaArrowRight />
          {/* <img src="/arr-white.png" className="arrow-icon h-4 mt-1 w-4" alt="arrow" /> */}
        </button>
      </div>
    </div>
  );
};

export default FoodPreferences;