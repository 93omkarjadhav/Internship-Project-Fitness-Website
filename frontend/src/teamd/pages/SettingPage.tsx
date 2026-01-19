// src/pages/SettingsPage.tsx
import React, { useState, useEffect } from "react";
import { FiSettings, FiUpload, FiLogOut, FiMessageCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  deleteAccount,
  getHelpArticles,
  getStreakData,
  getUserProfile, // ✅ same API used in ProfileSettings
} from "../api/api";
import { teamDPath } from "../constants";
import { ArrowRight } from "lucide-react";
import { ToggleSwitch } from "../components/ToggleSwitch";
import { toast } from "sonner";

// Images / assets
import frameMain from "../assets/Frame.jpg";
import avatar from "../assets/Avatar.jpg";
import pallate from "../assets/SettingPage/Patllete.jpg";
import SettingAvatar from "../assets/SettingPage/SettingAvatar.png";
import StarIconSetting from "../assets/SettingPage/StarIconSetting.png";
import AvatarBg from "../assets/SettingPage/AvatarBg.png";
import FireIconRed from "../assets/SettingPage/FireIconRed.png";
import UserIcon from "../assets/SettingPage/UserIcon.png";
import Rectangle from "../assets/SettingPage/Rectangle.png";
import BellIcon from "../assets/SettingPage/BellIcon.png";
import HealthSymbol from "../assets/SettingPage/HealthSymbol.png";
import BulbLight from "../assets/SettingPage/BulbLight.png";
import ChatIcon from "../assets/SettingPage/ChatIcon.png";
import Message from "../assets/SettingPage/Message.png";
import locked from "../assets/SettingPage/locked.png";
import Setting from "../assets/SettingPage/Settings.png";
import RightTick from "../assets/SettingPage/RightTick.png";
import NewStarIcon from "../assets/SettingPage/NewStarIcon.png";
import QuetionMark from "../assets/SettingPage/QuetionMark.png";
import Sharing from "../assets/SettingPage/Sharing.png";
import Sound from "../assets/SettingPage/Sound.png";
import link from "../assets/SettingPage/link.png";
// import FillHealthSymbol from "../assets/SettingPage/FillHealthSymbol.png"; // (unused)
import DeleteIcon from "../assets/SettingPage/DeleteIcon.png";
import chevronRightIcon from "../assets/SettingPage/chevron right.png";

interface SettingsState {
  soundNotification: boolean;
  dataSharing: boolean;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  weekly_status?: {
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
  };
}

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  rightIcon?: React.ReactNode;
}

export default function SettingsPage() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState<SettingsState>({
    soundNotification: false,
    dataSharing: false,
  });

  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loadingStreak, setLoadingStreak] = useState<boolean>(true);
  const [signingOut, setSigningOut] = useState(false);

  // ✅ New: profile image + name from API (same as ProfileSettings source)
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");

  // ---- Fetch Profile (image + name)
  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const { data } = await getUserProfile();
        setProfileImage(
          data.profile_image_url ||
          "https://cdn-icons-png.flaticon.com/512/847/847969.png"
        );
        // Use full_name, or extract username from email, or use email, or fallback to "User"
        const displayName = data.full_name || 
          (data.email ? data.email.split('@')[0] : null) || 
          data.email || 
          "User";
        setFullName(displayName);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // ---- Fetch Streak
  useEffect(() => {
    const fetchStreakData = async (): Promise<void> => {
      try {
        const response = await getStreakData();
        setStreakData(response.data);
      } catch (err) {
        console.error("Error fetching streak data:", err);
      } finally {
        setLoadingStreak(false);
      }
    };
    fetchStreakData();
  }, []);

  const toggleSetting = (key: keyof SettingsState): void => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = async (): Promise<void> => {
    if (window.confirm("Are you sure you want to delete your account? This action is permanent.")) {
      try {
        await deleteAccount();
        alert("Account deleted successfully.");
        localStorage.clear();
        navigate("/");
      } catch (err) {
        console.error("Error deleting account:", err);
        alert("Could not delete account. Please try again.");
      }
    }
  };

  const handleFaqIconClick = (): void => {
    navigate(teamDPath("faqs"));
  };

  const handleSignOut = () => {
    setSigningOut(true);
    setTimeout(() => {
      localStorage.removeItem("auth_token");
      toast.success("Signed out successfully");
      navigate("/", { replace: true });
    }, 1500);
  };

  // ✨ HELPER: Renders a group of individual popping cards
  const renderSettingGroup = (title: string, items: SettingItemProps[]) => (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">{title}</h3>
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={item.onClick}
            className={`bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-sm border border-gray-50 dark:border-gray-600 flex items-center justify-between transition-all duration-200 ${item.onClick ? "cursor-pointer active:scale-[0.99] hover:shadow-md dark:hover:bg-gray-600" : ""
              }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-gray-700 dark:text-white font-semibold text-[15px]">{item.label}</span>
            </div>
            <div>{item.rightIcon}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ width: "100%" }} className="bg-gray-50 dark:bg-gray-800 min-h-screen px-4 pb-10">
      {/* Back Button and Theme Toggle - Mobile */}
      <div className="md:hidden fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <button
          onClick={() => navigate("/welcome")}
          className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md"
          aria-label="Go back to home"
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Back Button and Theme Toggle - Desktop */}
      <div className="hidden md:flex absolute top-4 left-4 right-4 z-50 items-center justify-between">
        <button
          onClick={() => navigate("/welcome")}
          className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition"
          aria-label="Go back to home"
        >
          <svg className="w-6 h-6 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Header */}
      <div className="relative w-full">
        <img
          src={frameMain}
          alt="cover"
          className="w-full h-40 md:h-64 object-cover bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400"
        />

        <div className="absolute top-2/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-8">
          {/* <button className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition flex items-center justify-center w-12 h-12">
            <FiSettings className="text-gray-700 text-xl" />
          </button> */}

          <div className="relative w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full border-2 md:border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden flex items-center justify-center bg-white dark:bg-gray-700">
            {/* ✅ Use fetched image; fallback to default avatar */}
            <img
              src={profileImage || avatar}
              alt="profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* <div
            className="absolute right-0 transform bottom-0 -translate-x-1/2 translate-y-1/2 bg-dark text-white p-2 rounded-full shadow-md cursor-pointer z-10"
            style={{ marginTop: "25px", marginRight: "64px", backgroundColor: "#040405" }}
          >
            <FiUpload size={16} />
          </div> */}

          {/* <button className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition flex items-center justify-center w-12 h-12">
            <img src={pallate} alt="" />
          </button> */}
        </div>
        <div className="pt-16 md:pt-20 lg:pt-28 -mt-5 text-center">

          {/* <span
            className="inline-flex items-center gap-1 mt-4 px-3 py-1 text-blue-700 rounded text-sm font-medium border border-blue"
            style={{ border: "1.5px solid #2563EB", borderRadius: "11px" }}
          >
            <img src={NewStarIcon} alt="" style={{ width: "12px" }} />
            <span style={{ color: "#2563EB" }}>fitfare plus</span>
          </span> */}

          {/* <p className="text-gray-500 mt-1 text-sm">
            Member since Dec 2026
          </p> */}

          <h2
            className="text-3xl Plus Jakarta Sans text-gray-800 dark:text-white mt-1 font-bold"
            style={{ fontWeight: "bolder" }}
          >
            {fullName || "User"}
          </h2>

        </div>

      </div>

      {/* Invite Section */}
      <div
        onClick={() => navigate(teamDPath("referral-code"))}
        className="bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-sm mb-8 mt-6 flex items-center justify-between h-auto cursor-pointer hover:shadow-md transition"
      >
        <div>
          <p className="text-gray-700 dark:text-white font-bold mb-1">
            Invite Friend To Get Healthier & Get Coupons!
          </p>
          <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold flex items-center gap-1 pointer-events-none">
            Invite Friend <ArrowRight size={16} />
          </button>
        </div>
        <div
          className="w-24 h-24 flex items-center justify-center bg-cover"
          style={{ backgroundImage: `url(${AvatarBg})` }}
        >
          <img
            src={SettingAvatar}
            alt="Avatar"
            className="w-20 h-20 object-contain rounded-full"
          />
        </div>
      </div>



      {/* GENERAL SETTINGS */}
      {renderSettingGroup("General ", [
        {
          icon: <img src={UserIcon} alt="" className="dark:invert" />,
          label: "Profile Settings",
          onClick: () => navigate(teamDPath("profile-settings")),
          rightIcon: <img src={chevronRightIcon} alt="" className="dark:invert" />,
        },
      ])}


      <div
        className="bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-sm mt-4 mb-8 border border-gray-50 dark:border-gray-600 cursor-pointer hover:shadow-md transition-all"
        onClick={() => navigate(teamDPath("settings/streak"))}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-800 dark:text-white">Total Streak</h3>
          {loadingStreak ? (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">...</p>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {streakData ? streakData.current_streak : 0} days
            </p>
          )}
        </div>

        <hr className="border-t border-gray-100 dark:border-gray-600 mb-4" />

        <div
          className="flex items-start space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate(teamDPath("settings/streak"))}
        >
          <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center border border-pink-200 dark:border-pink-800">
            <img src={FireIconRed} alt="" />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-gray-800 dark:text-white">
              {streakData && streakData.current_streak === 1
                ? "You're on fire!"
                : streakData && streakData.current_streak === 2
                ? "Keep it up!"
                : streakData && streakData.current_streak === 3
                ? "Keep going!"
                : streakData && streakData.current_streak >= 4
                ? `Amazing! ${streakData.current_streak} days strong!`
                : "You're on fire!"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Keep using the app to get benefits!
            </p>
          </div>

          <div className="flex items-center">
            <img src={chevronRightIcon} alt="" className="w-5 h-5 dark:invert" />
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {/* {renderSettingGroup("Notifications", [
        { icon: <img src={HealthSymbol} alt="" />, label: "Health Reminder", rightIcon: <img src={chevronRightIcon} alt="" /> },
        { icon: <img src={BulbLight} alt="" />, label: "Insight Update", onClick: () => navigate(teamDPath("notification-settings")), rightIcon: <img src={chevronRightIcon} alt="" /> },
        { icon: <img src={BellIcon} alt="" />, label: "General Notification", rightIcon: <img src={chevronRightIcon} alt="" /> },
        { icon: <img src={Message} alt="" />, label: "Email Notification", rightIcon: <img src={chevronRightIcon} alt="" /> },
        {
          icon: <img src={Sound} alt="" />,
          label: "Sound Notification",
          rightIcon: (
            <ToggleSwitch
              checked={settings.soundNotification}
              onChange={() => toggleSetting("soundNotification")}
            />
          ),
        },
      ])} */}

      {/* SECURITY */}
      {renderSettingGroup("Security & Privacy", [
        { icon: <img src={locked} alt="" className="dark:invert" />, label: "Change Password", onClick: () => navigate(teamDPath("change-password")), rightIcon: <img src={chevronRightIcon} alt="" className="dark:invert" /> },
        // {
        //   icon: <img src={Sharing} alt="" />,
        //   label: "Data Sharing",
        //   rightIcon: (
        //     <ToggleSwitch
        //       checked={settings.dataSharing}
        //       onChange={() => toggleSetting("dataSharing")}
        //     />
        //   ),
        // },
        { icon: <img src={RightTick} alt="" className="dark:invert" />, label: "Change Passcode", onClick: () => navigate(teamDPath("passcode-protection")), rightIcon: <img src={chevronRightIcon} alt="" className="dark:invert" /> },
      ])}

      {/* HELP */}
      {renderSettingGroup("Help & Support", [
        { icon: <img src={QuetionMark} alt="" className="dark:invert" />, label: "FAQs", onClick: handleFaqIconClick, rightIcon: <img src={chevronRightIcon} alt="" className="dark:invert" /> },
        // { icon: <img src={ChatIcon} alt="" />, label: "Live Chat", onClick: () => navigate(teamDPath("ai-chat")), rightIcon: <img src={chevronRightIcon} alt="" /> },
        // { icon: <img src={StarIconSetting} style={{ width: "20px" }} alt="" />, label: "Feature Request", rightIcon: <img src={link} alt="" /> },
        // { icon: <img src={Setting} alt="" />, label: "What's New", rightIcon: <img src={link} alt="" /> },
      ])}

      {/* FEEDBACK */}
      {renderSettingGroup("Feedback", [
        { icon: <FiMessageCircle size={20} className="text-gray-500 dark:text-gray-400" />, label: "Send Feedback", onClick: () => navigate(teamDPath("feedback")), rightIcon: <img src={chevronRightIcon} alt="" className="dark:invert" /> },
      ])}

      {/* DANGER ZONE */}
      {renderSettingGroup("Danger Zone", [
        { icon: <img src={DeleteIcon} alt="" className="dark:invert" />, label: "Delete Account", onClick: handleDeleteAccount, rightIcon: <img src={chevronRightIcon} alt="" className="dark:invert" /> },
      ])}

      {/* Footer */}
      <div className="flex flex-col items-center justify-center mt-10">
        <button className="text-blue-600 dark:text-blue-400 font-medium mb-5 flex items-center justify-center mx-auto gap-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors" onClick={handleSignOut}>
          <span className="fw-bolder font-extrabold">Sign Out</span> <FiLogOut />
        </button>
      </div>

      {signingOut && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex flex-col items-center justify-center z-[9999]">
          <div className="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-xl font-semibold mt-4">Signing out...</p>
        </div>
      )}
    </div>
  );
}
