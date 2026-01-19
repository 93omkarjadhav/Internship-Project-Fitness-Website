import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMenu } from "react-icons/io5";

const CalendarCard: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col justify-between h-screen w-screen bg-[#f9fbff] overflow-hidden font-[Plus Jakarta Sans Regular]">
      {/* MAIN CONTENT */}
      <div className="flex flex-col items-center text-center px-6 py-6 flex-1 mt-8 md:mt-12 lg:mt-16">
        <img
          src="/week2-assets/img.png"
          alt="Calendar"
          className="w-78 sm:w-[250px] md:w-[340px] lg:w-[350px] mb-4 object-contain"
        />

        <h2 className="text-[28px] md:text-3xl sm:text-2xl text-[#0c1b3d] leading-snug font-bold">
          Monitor Your Cycle Understand Your Body.
        </h2>

        <p className="text-gray-500 text-[18px] md:text-sm sm:text-xs mt-3 mb-6">
          Your health journey starts with clarity and care.
        </p>

        <button
          onClick={() => navigate("/period/setup-intro")}
          className="mt-8 bg-[#0059FF] hover:bg-[#0044cc] text-white 
          w-80 md:w-72 sm:w-64 py-3 rounded-xl 
          flex items-center justify-center gap-3 shadow-md 
          transform transition duration-200 hover:scale-105"
        >
          <img src="/week2-assets/Vector (17).png" alt="profile" className="w-4 h-4" />
          <span className="text-base sm:text-sm">Get Started</span>
          <img src="/week2-assets/Vector (18).png" alt="arrow" className="w-4 h-4" />
        </button>
      </div>

      {/* NAVIGATION – MOBILE BOTTOM, DESKTOP FULL LEFT CARD */}
      <div
        className={`
    fixed bottom-0 left-0 w-full 
    flex justify-around items-center 
    bg-white border-t border-gray-200 py-2 shadow-sm z-10

    lg:flex-col lg:justify-start lg:items-start
    lg:top-0 lg:left-0 lg:h-full 
    lg:border-r lg:border-gray-300 lg:py-6 lg:px-4

    transition-all duration-300
    ${collapsed ? "lg:w-16" : "lg:w-56"}
  `}
      >
        {/* Hamburger Button (Desktop Only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block mb-6"
        >
          <IoMenu size={28} />
        </button>

        {/* HOME */}
        <div className="flex flex-col items-center text-gray-500 text-xs lg:flex-row lg:items-center lg:gap-3 lg:mb-6">
          <img src="/week2-assets/Monotone add.png" className="w-6 h-6 mb-1 lg:mb-0" />
          {!collapsed && <span className="text-[10px] lg:text-base">Home</span>}
        </div>

        {/* AI ASSISTANT */}
        <div className="flex flex-col items-center text-gray-500 text-xs lg:flex-row lg:items-center lg:gap-3 lg:mb-6">
          <img src="/week2-assets/Monotone add (1).png" className="w-6 h-6 mb-1 lg:mb-0" />
          {!collapsed && <span className="text-[10px] lg:text-base">AI Assistant</span>}
        </div>

        {/* ADD BUTTON */}
        <div className="flex flex-col items-center -mt-4 lg:mt-0 lg:mb-6">
          <img src="/week2-assets/Button Icon.png" className="w-12 h-13 mt-3" />
        </div>

        {/* RESOURCES */}
        <div className="flex flex-col items-center text-gray-500 text-xs lg:flex-row lg:items-center lg:gap-3 lg:mb-6">
          <img src="/week2-assets/Monotone add (2).png" className="w-6 h-6 mb-1 lg:mb-0" />
          {!collapsed && <span className="text-[10px] lg:text-base">Resources</span>}
        </div>

        {/* PROFILE */}
        <div className="flex flex-col items-center text-gray-500 text-xs lg:flex-row lg:items-center lg:gap-3">
          <img src="/week2-assets/Monotone add (3).png" className="w-6 h-6 mb-1 lg:mb-0" />
          {!collapsed && <span className="text-[10px] lg:text-base">Profile</span>}
        </div>
      </div>
    </div>
  );
};

export default CalendarCard;

{
  "cells": [],
  "metadata": {
    "language_info": {
      "name": "python"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 2
}