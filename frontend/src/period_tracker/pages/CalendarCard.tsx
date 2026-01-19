import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { useUserGender } from "../../hooks/useUserGender";

/* ========================= SIDEBAR ========================= */

const NavItem = ({
  icon,
  label,
  sidebarOpen,
  onClick,
}: {
  icon: string;
  label: string;
  sidebarOpen: boolean;
  onClick?: () => void;
}) => {
  const isNutrition = icon.includes('Vector (17)');
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer
        text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all
        ${sidebarOpen ? "justify-start" : "justify-center"}
      `}
    >
      <img
        src={icon}
        className="w-6 h-6"
        style={isNutrition ? { filter: 'grayscale(100%) brightness(0.5) opacity(0.7)' } : {}}
      />
      {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
};

const Sidebar = ({ sidebarOpen }: { sidebarOpen: boolean }) => {
  const { userGender } = useUserGender();

  return (
    <div
      className={`
        hidden lg:flex lg:flex-col lg:justify-start
        lg:fixed lg:top-0 lg:left-0 lg:h-full
        bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-sm z-50
        transition-all duration-300
        overflow-x-hidden
        ${sidebarOpen ? "lg:w-60" : "lg:w-20"}
      `}
    >
      <div className="mt-[100px] flex flex-col gap-8 px-3">
        <NavItem
          icon="/home-gray.png"
          label="Home"
          sidebarOpen={sidebarOpen}
          onClick={() => (window.location.href = "/welcome")}
        />
        <NavItem
          icon="/ai-pic.png"
          label="AI Assistant"
          sidebarOpen={sidebarOpen}
          onClick={() => (window.location.href = "/wellness/ai-chat")}
        />
        <NavItem
          icon="/resources.png"
          label="My Bookings"
          sidebarOpen={sidebarOpen}
        />
        {userGender === 'Female' || userGender === null ? (
          <NavItem
            icon="/cycle-1.png"
            label="Periods Cycle"
            sidebarOpen={sidebarOpen}
          />
        ) : null}
        <NavItem
          icon="/leaf-1.png"
          label="Nutrition"
          sidebarOpen={sidebarOpen}
          onClick={() => (window.location.href = "/nutrition/home")}
        />
        <NavItem
          icon="/Monotone add (6).png"
          label="Profile"
          sidebarOpen={sidebarOpen}
          onClick={() => (window.location.href = "/wellness/settings")}
        />
      </div>
    </div>
  );
};

/* ========================= MAIN PAGE ========================= */

const CalendarCard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-[#f9fbff] dark:bg-gray-900 overflow-hidden font-[Plus Jakarta Sans Regular]">

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* MAIN CONTENT — FIXED, DOES NOT MOVE */}
      <div
        className={`
    flex flex-col flex-1 
    overflow-y-auto overflow-x-hidden 
    transition-all duration-300 justify-center
    ${sidebarOpen ? "lg:ml-60" : "lg:ml-20"}
    p-6
  `}
      >

        {/* Hamburger and Theme Toggle for desktop */}
        <div className="hidden lg:flex fixed top-6 left-6 z-[500] items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white dark:bg-gray-800 dark:text-white rounded-md p-2"
          >
            <IoMenu size={22} />
          </button>
        </div>


        {/* MAIN CENTER CONTENT */}
        <div className="flex flex-col items-center text-center mx-auto">
          <img
            src="/week2-assets/img.png"
            alt="Calendar"
            className="w-78 sm:w-[250px] md:w-[320px] lg:w-[350px] mb-4 object-contain"
          />

          <h2 className="text-[28px] md:text-3xl sm:text-2xl text-[#0c1b3d] dark:text-white leading-snug font-bold">
            Monitor Your Cycle Understand Your Body.
          </h2>

          <p className="text-gray-500 dark:text-gray-400 text-[18px] md:text-sm sm:text-xs mt-3 mb-6">
            Your health journey starts with clarity and care.
          </p>

          <button
            onClick={() => navigate("/period/setup-intro")}
            className="mt-8 bg-[#0059FF] hover:bg-[#0044cc] text-white 
            w-80 md:w-72 sm:w-64 py-3 rounded-xl 
            flex items-center justify-center gap-3 shadow-md 
            transform transition duration-200 hover:scale-105"
          >
            <img src="/week2-assets/Vector (17).png" className="w-4 h-4" />
            <span className="text-base sm:text-sm">Get Started</span>
            <img src="/week2-assets/Vector (18).png" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div
        className="
        fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800
        flex justify-around items-center py-2 border-t border-gray-200 dark:border-gray-700
        shadow-sm z-50 lg:hidden
      "
      >
        <div
          onClick={() => navigate("/welcome")}
          className="flex flex-col items-center text-gray-500 dark:text-gray-400 text-xs"
        >
          <img src="/week2-assets/Monotone add.png" className="w-6 h-6" />
          <span>Home</span>
        </div>

        <div
          onClick={() => navigate("/wellness/ai-chat")}
          className="flex flex-col items-center text-gray-500 dark:text-gray-400 text-xs"
        >
          <img src="/week2-assets/Monotone add (1).png" className="w-6 h-6" />
          <span>AI</span>
        </div>

        <img src="/week2-assets/Button Icon.png" className="w-12 h-12 -mt-6" />

        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 text-xs">
          <img src="/week2-assets/Monotone add (2).png" className="w-6 h-6" />
          <span>Resources</span>
        </div>

        <div
          onClick={() => navigate("/wellness/settings")}
          className="flex flex-col items-center text-gray-500 dark:text-gray-400 text-xs"
        >
          <img src="/week2-assets/Monotone add (3).png" className="w-6 h-6" />
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarCard;
