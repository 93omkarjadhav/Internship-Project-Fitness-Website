import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "@/teamd/api/api";
import "./Setupintro.css";

const SetupIntro = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("Mori");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await getUserProfile();
        if (!active) return;
        const name = data?.full_name || data?.email?.split("@")?.[0] || "Mori";
        setDisplayName(name);
      } catch (e) {
        // keep default fallback
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="setup-page">
      <div className="overlay">
        <div className="dialog-box">
          <button
            onClick={() => navigate("/nutrition/home")}
            className="absolute top-4 left-4 p-2 hover:opacity-70 transition z-20"
            aria-label="Go back"
          >
            <img src="/chevron left (2).png" alt="Back" className="w-5 h-5" style={{ filter: 'brightness(0)' }} />
          </button>
          {/* ---------- Logo Section ---------- */}
          <img src="/logo.png" alt="FitFare Logo" className="mb-4 setup-logo" />

          

          <p className="dialog-text">
            Hey! {displayName} I'm FitFare AI I'll guide you through setting up you your nutrition today. Are you ready?
            {/* <img src="/apple.png" className="apple-icon" alt="apple" /> */}
          </p>

          <div className="button-section">
            <button className="btn primary gap-2" onClick={() => navigate("/nutrition/food-preferences")}>
              Yes, start 
              <img src="/arr-white.png" className=" h-4 w-4 mt-1" alt="arrow" />
            </button>

            {/* ---------- Replaced Pencil Icon with Image ---------- */}
            {/* <button className="btn border-2 text-blue-600 font-medium border-blue-600">
              No, I'll set up manually{" "}
              <img src="/edit pencil.png" alt="Edit" className="edit-icon" />
            </button> */}

            <button className="btn bg-red-500 text-white gap-2" onClick={() => navigate("/nutrition/home")}>
              <img src="/chevron left (2).png" alt="Edit" className="w-5 h-5" />
              No, go back
              
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupIntro;