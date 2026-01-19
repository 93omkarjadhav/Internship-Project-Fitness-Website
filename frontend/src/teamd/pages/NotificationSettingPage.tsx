// src/pages/NotificationSettingPage.tsx
import { useState, useEffect } from "react";
import { getNotifications, updateNotifications } from "../api/api";
import { ToggleSwitch } from "../components/ToggleSwitch";
import bellIcon from "../assets/NotificationSettings/BellIcon.png";
import Disclaimer from "../assets/NotificationSettings/Disclaimer.png";
import Leaf from "../assets/NotificationSettings/Leaf.png";
import PenDriveIcon from "../assets/NotificationSettings/PenDriveIcon.png";
import SquareDesign from "../assets/NotificationSettings/SquareDesign.png";
import RightIcon from "../assets/NotificationSettings/RightIcon.png";

interface NotificationSettings {
  activityReminder: boolean;
  pushNotification: boolean;
  nutritionReminder: boolean;
  aiRecommendations: boolean;
  weeklyInsight: boolean;
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    activityReminder: false,
    pushNotification: false,
    nutritionReminder: false,
    aiRecommendations: false,
    weeklyInsight: false,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSettings = async (): Promise<void> => {
      try {
        const { data } = await getNotifications();
        setSettings({
          activityReminder: data.activity_reminder,
          pushNotification: data.push_notification,
          nutritionReminder: data.nutrition_reminder,
          aiRecommendations: data.ai_recommendations,
          weeklyInsight: data.weekly_insight,
        });
      } catch (err) {
        console.error("Error fetching notification settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async (key: keyof NotificationSettings): Promise<void> => {
    const newSettings: NotificationSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);

    try {
      await updateNotifications(newSettings);
    } catch (err) {
      console.error("Error updating notification settings:", err);
      setSettings(settings);
    }
  };

  // ✨ HELPER: Reusable Card Component
  const NotificationCard = ({
    icon,
    title,
    description,
    action,
  }: {
    icon: string;
    title: string;
    description?: string;
    action: React.ReactNode;
  }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between mb-3 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-4">
        {/* Icon Container */}
        <div className=" flex items-center justify-center">
          <img src={icon} alt="" className="w-full h-full object-contain" />
        </div>
        {/* Text */}
        <div>
          <p className="font-semibold text-gray-800 text-[15px]">{title}</p>
          {description && (
            <p className="text-gray-400 text-xs mt-0.5 leading-tight max-w-[200px] sm:max-w-xs">
              {description}
            </p>
          )}
        </div>
      </div>
      {/* Action (Toggle or Icon) */}
      <div>{action}</div>
    </div>
  );
  const pushDescription = settings.pushNotification
  ? "Push notifications are enabled."
  : "Push notifications are disabled.";

  if (loading) {
    return <div className="p-6 bg-gray-50 min-h-screen">Loading...</div>;
  }

  return (
    <div style={{ width: "100%" }} className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-1">Notification Settings</h2>
      <p className="text-gray-500 mb-6">Change your notification settings here.</p>

      {/* Health Reminder Section */}
      <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Health Reminder</h3>
      <div className="mb-8">
        <NotificationCard
          icon={bellIcon}
          title="Activity Reminder"
          description="Shake your phone to randomize your account balances."
          action={
            <ToggleSwitch
              checked={settings.activityReminder}
              onChange={() => handleToggle("activityReminder")}
            />
          }
        />

        {/* Push Notification with Toggle */}
        <NotificationCard
            icon={Disclaimer}
            title="Push Notification"
            description={pushDescription}
            action={
              <ToggleSwitch
                checked={settings.pushNotification}
                onChange={() => handleToggle("pushNotification")}
              />
            }
          />



        <NotificationCard
          icon={Leaf}
          title="Nutrition Reminder"
          action={
            <ToggleSwitch
              checked={settings.nutritionReminder}
              onChange={() => handleToggle("nutritionReminder")}
            />
          }
        />
      </div>

      {/* Insight Section */}
      <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Insight</h3>
      <div className="mb-8">
        <NotificationCard
          icon={SquareDesign}
          title="AI Recommendations"
          action={
            <ToggleSwitch
              checked={settings.aiRecommendations}
              onChange={() => handleToggle("aiRecommendations")}
            />
          }
        />

        <NotificationCard
          icon={PenDriveIcon}
          title="Weekly Insight"
          description="Shake your phone to randomize your account balances."
          action={
            <ToggleSwitch
              checked={settings.weeklyInsight}
              onChange={() => handleToggle("weeklyInsight")}
            />
          }
        />
      </div>
    </div>
  );
}