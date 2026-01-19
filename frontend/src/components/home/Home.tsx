// src/pages/Home.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserGender } from "../../hooks/useUserGender";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { userGender } = useUserGender();

  return (
    <div className="h-screen overflow-hidden bg-gray-100">

      {/* ===== FIXED HAMBURGER BUTTON ===== */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed w-5 h-5 top-5 left-6 z-[400] bg-white p-2 md:flex hidden"
      >
        ☰
      </button>

      {/* ======= SIDEBAR (Desktop) EXACT FROM Welcome.tsx ======= */}
      <div
        className={`
          hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:h-full
          bg-white border-r shadow-sm transition-all duration-300
          ${sidebarOpen ? "md:w-60" : "md:w-20"}
        `}
      >
        <div className="mt-[100px] flex flex-col gap-8 px-3">
          <Link to="/welcome">
            <NavItem icon="/home-gray.png" label="Home" sidebarOpen={sidebarOpen} />
          </Link>

          <Link to="/wellness/ai-chat">
            <NavItem icon="/ai-pic.png" label="AI Assistant" sidebarOpen={sidebarOpen} />
          </Link>

          <Link to="/bookings">
            <NavItem icon="/resources.png" label="My Bookings" sidebarOpen={sidebarOpen} />
          </Link>

          {userGender === 'Female' || userGender === null ? (
            <Link to="/cycles">
              <NavItem icon="/cycle-1.png" label="Periods Cycle" sidebarOpen={sidebarOpen} />
            </Link>
          ) : null}

          <Link to="/nutrition/home">
            <NavItem icon="/leaf-1.png" label="Nutrition" sidebarOpen={sidebarOpen} />
          </Link>

          <Link to="/wellness/settings">
            <NavItem icon="/Monotone add (6).png" label="Profile" sidebarOpen={sidebarOpen} />
          </Link>
        </div>
      </div>

      {/* ========= MOBILE BOTTOM NAV ========= */}
      <div
        className="
          md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md
          flex items-center justify-between px-8 py-4
        "
      >
        <Link to="/welcome" className="flex flex-col items-center text-gray-600">
          <img src="/home-gray.png" className="w-6 h-6" />
          <span className="text-[11px] mt-1">Home</span>
        </Link>

        <Link to="/wellness/ai-chat" className="flex flex-col items-center text-gray-600">
          <img src="/ai-pic.png" className="w-6 h-6" />
          <span className="text-[11px] mt-1">AI Assistant</span>
        </Link>

        {/* Center FAB Add Button */}
        <button className="w-14 h-14" onClick={() => setMenuOpen(true)}>
          <img src="/Button Icon (1).png" className="w-full" />
        </button>

        <Link to="/bookings" className="flex flex-col items-center text-gray-600">
          <img src="/resources.png" className="w-6 h-6" />
          <span className="text-[11px] mt-1">My Bookings</span>
        </Link>

        <Link to="/wellness/settings" className="flex flex-col items-center text-gray-600">
          <img src="/Monotone add (6).png" className="w-6 h-6" />
          <span className="text-[11px] mt-1">Profile</span>
        </Link>
      </div>

      {/* ===== POPUP QUICK ACTIONS ===== */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="
              fixed bottom-24 left-0 right-0 mx-auto
              w-[90%] max-w-xs bg-white rounded-3xl shadow-xl p-6
              flex justify-around z-[70]
            "
          >
            <PopupItem icon="/leaf.png" label="Nutrition" link="/nutrition/home" />
            {userGender === 'Female' || userGender === null ? (
              <PopupItem icon="/cycle.png" label="Cycles" link="/cycles" />
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/period-restricted");
                }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <img src="/cycle.png" className="opacity-50" />
                </div>
                <span className="text-xs mt-1 text-gray-500">Cycles</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* ======= MAIN CONTENT AREA ======= */}
      <div
        className={`
          h-full flex flex-col items-center justify-center px-4
          transition-all duration-300
          ${sidebarOpen ? "md:ml-60" : "md:ml-20"}
        `}
      >
        <img src="/B3.png" alt="Nutrition Illustration" className="w-64" />
        <h2 className="text-2xl font-semibold mt-4 text-center">
          Log your Nutrition Daily To Get Better Result
        </h2>
        <p className="text-gray-600 mt-2">Let's manage your nutrition with ease</p>

        <button
          className="continue-btn3 mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl"
          onClick={() => navigate("/nutrition/setup")}
        >
          Get Started
          <img src="/arr-white.png" alt="arrow" className="w-4" />
        </button>
      </div>
    </div>
  );
};

/* --- Shared Nav Item Component --- */
const NavItem = ({ icon, label, sidebarOpen }: any) => {
  const isNutrition = icon.includes('Vector (17)');
  return (
    <div
      className={`
        flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer
        text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all
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

const PopupItem = ({ icon, label, link = "#" }: any) => (
  <Link to={link} className="flex flex-col items-center">
    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
      <img src={icon} />
    </div>
    <span className="text-xs mt-1">{label}</span>
  </Link>
);

export default Home;
