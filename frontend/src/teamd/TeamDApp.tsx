import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";

import "@fontsource/plus-jakarta-sans";
import "./index.css";
import "./App.css";
import "./DatePicker.css";

import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingPage";
import Streak from "./pages/Streak";
import SecuritySettings from "./pages/Securitypage";
import NotificationSettingPage from "./pages/NotificationSettingPage";
import PasscodeProtection from "./pages/security/PasscodeProtection";
import SetPasscode from "./pages/security/Setpasscode";
import ChangePassword from "./pages/ChangePassword";
import ProfileSettings from "./pages/ProfileSettings";
import FeedbackPage from "./pages/Feedback";
import Chat from "./pages/Chat";
import Onboarding from "./pages/Onboarding";
import ReferralCode from "./pages/ReferralCode";
import InviteFriends from "./pages/InviteFriends";
import ReferralSuccess from "./pages/ReferralSuccess";
import AddContact from "./pages/AddContact";
import About from "./pages/About";
import FAQsPage from "./pages/FAQsPage";

const loaderClass =
  "min-h-screen flex items-center justify-center bg-gray-50 text-gray-600";

const TeamDApp = () => {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );

  useEffect(() => {
    const syncSession = async () => {
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        setStatus("error");
        return;
      }

      localStorage.setItem("token", authToken);

      if (localStorage.getItem("userId")) {
        setStatus("ready");
        return;
      }

      setStatus("loading");
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const userId = res.data?.user?.id;
        if (userId) {
          localStorage.setItem("userId", userId.toString());
        }
        setStatus("ready");
      } catch (error) {
        console.error("Failed to sync FitFare AI session:", error);
        setStatus("error");
      }
    };

    syncSession();
  }, []);

  if (status === "idle" || status === "loading") {
    return (
      <div className={loaderClass}>
        <p>Preparing your FitFare AI experience...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={loaderClass}>
        <div className="text-center space-y-4">
          <p>We couldn&apos;t verify your session. Please sign in again.</p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="settings/streak" element={<Streak />} />
      <Route path="security-settings" element={<SecuritySettings />} />
      <Route path="notification-settings" element={<NotificationSettingPage />} />
      <Route path="passcode-protection" element={<PasscodeProtection />} />
      <Route path="set-passcode" element={<SetPasscode />} />
      <Route path="change-password" element={<ChangePassword />} />
      <Route path="profile-settings" element={<ProfileSettings />} />
      <Route path="feedback" element={<FeedbackPage />} />
      <Route path="ai-chat" element={<Chat />} />
      <Route path="ai-onboarding" element={<Onboarding />} />
      <Route path="referral-code" element={<ReferralCode />} />
      <Route path="invite-friends" element={<InviteFriends />} />
      <Route path="add-contact" element={<AddContact />} />
      <Route path="referral-success" element={<ReferralSuccess />} />
      <Route path="about" element={<About />} />
      <Route path="faqs" element={<FAQsPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
};

export default TeamDApp;

