import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNutritionProfile } from "../context/NutritionProfileContext";

const NutritionSummary = () => {
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { submitProfile, resetProfile } = useNutritionProfile();

  // 🔥 STEP 1 — Remove this page from browser history IMMEDIATELY
  useEffect(() => {
    window.history.replaceState(null, "", "/_safe-nutrition-summary");
  }, []);

  // 🔥 STEP 2 — Prevent browser back from reopening this page
  useEffect(() => {
    const blockBack = () => {
      window.history.forward();
    };
    window.addEventListener("popstate", blockBack);

    return () => window.removeEventListener("popstate", blockBack);
  }, []);

  // 🔥 STEP 3 — Auto save + minimum 3s loading + redirect
  useEffect(() => {
    const process = async () => {
      const minDelay = new Promise((res) => setTimeout(res, 3000)); // minimum 3s UI

      // Delay 1s before DB save
      await new Promise((res) => setTimeout(res, 1000));

      try {
        const success = await submitProfile();

        if (!success) {
          setError("Unable to save your profile.");
          setSaving(false);
          return;
        }

        resetProfile();

        // Ensure at least 3s loading
        await minDelay;

        // Redirect without adding new history entry
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error(err);
        setError("Something went wrong.");
        setSaving(false);
      }
    };

    process();
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-100 flex flex-col items-center justify-center">
      {saving ? (
        <>
          {/* Spinner */}
          {/* <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div> */}
          <img src="logo.png" alt="" className="w-20 h-20" />

          <p className="mt-6 text-gray-700 text-lg font-medium">
            Please wait while we set up your nutrition...
          </p>
        </>
      ) : (
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <p className="text-gray-600 mt-2 text-sm">Please try again.</p>
        </div>
      )}
    </div>
  );
};

export default NutritionSummary;
