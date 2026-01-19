// src/pages/Securitypage.tsx
import { useState, useEffect } from "react";
import { api } from "../api/api";
import { ToggleSwitch } from "../components/ToggleSwitch";
// Icon Imports (Adjusted usage for clarity and to match image icons)
import FingerPrint from "../assets/MainSecurityPage/FingerPrint.jpg"; // Used for Biometric & FaceID
import keyIcon from "../assets/MainSecurityPage/keyIcon.jpg";       // Used for Pin Code
import LockIcon from "../assets/MainSecurityPage/LockIcon.jpg";     // Used for Remember Login
import LogoutIcon from "../assets/MainSecurityPage/LogoutIcon.jpg"; // Used for Account Recovery
import ProfileAc from "../assets/MainSecurityPage/ProfileAc.jpg";   // Used for Log Out
import rightArrow from "../assets/ChangePassword/RightArrow.png"
import chevronRightIcon from "../assets/SettingPage/chevron right.png"

interface SecuritySettings {
  enablePin: boolean;
  biometricLogin: boolean; 
  rememberLogin: boolean;
  useFaceId: boolean;
  accountRecovery: boolean;
}

interface SettingRowProps {
  iconSrc: string;
  title: string;
  description?: string;
  control: React.ReactNode;
  onClick: () => void;
}

// --- NEW: Helper Component for consistent row rendering (Recommended) ---

// This component standardizes the look of each setting row.
const SettingRow: React.FC<SettingRowProps> = ({ iconSrc, title, description, control, onClick }) => {
    return (
        <div 
            className="flex justify-between items-center bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm cursor-pointer hover:shadow-md dark:hover:bg-gray-600 transition-all active:scale-[0.99]"
            onClick={onClick} // Allow clicking the whole row for navigation/toggle
        >
            {/* Left Section: Icon, Title, and Description */}
            <div className="flex items-center space-x-4">
                {/* Icon Container with background color */}
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-transparent dark:bg-transparent" 
                     // Using a placeholder color for the icon background since the image is solid.
                     // You might need a more specific class for the background color in the image.
                     
                >
                    {/* The image tag needs proper styling to show the small icon */}
                    <img src={iconSrc} alt={`${title} icon`} className="w-5 h-5 object-contain font-extrabold dark:invert" />
                </div>
                
                {/* Text Content */}
                <div className="flex flex-col">
                    <h4 className="font-bold text-gray-800 dark:text-white">{title}</h4>
                    {description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            
            {/* Right Section: Control (Toggle or Arrow) */}
            <div className="flex-shrink-0">
                {control}
            </div>
        </div>
    );
};


export default function SecuritySettings() {
    const [settings, setSettings] = useState<SecuritySettings>({
        enablePin: false,
        biometricLogin: false, 
        rememberLogin: true,
        useFaceId: false,
        accountRecovery: true,
    });
    const [loading, setLoading] = useState<boolean>(true);

    // --- Fetch settings on page load (Unchanged logic) ---
    useEffect(() => {
        const fetchSettings = async (): Promise<void> => {
            try {
                const { data } = await api.get(`/wellness/security`);
                setSettings({
                    enablePin: data.enable_pin,
                    biometricLogin: data.biometric_login, 
                    rememberLogin: data.remember_login,
                    useFaceId: data.use_face_id,
                    accountRecovery: data.account_recovery,
                });
            } catch (err) {
                console.error("Error fetching security settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);


    // --- Handle toggle and auto-save (Unchanged logic) ---
    const toggleSetting = async (key: keyof SecuritySettings): Promise<void> => {
        const newSettings = { ...settings, [key]: !settings[key] };
        
        setSettings(newSettings);

        try {
            await api.put(`/wellness/security`, newSettings);
        } catch (err) {
            console.error("Error updating security settings:", err);
            setSettings(settings); 
            alert("Error saving settings.");
        }
    };
    
    // --- Navigation Handlers ---
    const handleNavigation = (path: string): void => {
        // Example logic for navigation items like Biometric Login
        console.log(`Navigating to ${path}`);
        // navigate(path);
    }
    
    // --- Log Out Handler ---
    const handleLogout = (): void => {
        // Logic to clear tokens and log out
        console.log("Logging out from all devices...");
        // navigate('/login');
    }

    if (loading) {
        return <div className="p-5 bg-gray-50 dark:bg-gray-800 min-h-screen text-gray-900 dark:text-white">Loading...</div>;
    }

    return (
        <div style={{ width:"100%" }} className="p-5 bg-white dark:bg-gray-800 sm:bg-gray-50 dark:sm:bg-gray-800 min-h-screen">
            {/* Header Text */}
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Security Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">
                Your health privacy matters. Control and own your data here.
            </p>

            {/* Settings List */}
            <div className="space-y-3 ">
                
                {/* 1. ENABLE PIN CODE (Toggle) */}
                <SettingRow
                    iconSrc={keyIcon}
                    title="Enable Pin Code"
                    description="Shake your phone to randomize your account balances."
                    control={
                        <ToggleSwitch
                            checked={settings.enablePin}
                            onChange={() => toggleSetting("enablePin")}
                        />
                    }
                    onClick={() => toggleSetting("enablePin")}
                />

                {/* 2. BIOMETRIC LOGIN (Arrow/Navigation) */}
                {/* <SettingRow
                    iconSrc={FingerPrint}
                    title="Biometric Login"
                    description="Shake your phone to randomize your account balances."
                    control={<span className="text-xl text-gray-400 font-bold"><img src={chevronRightIcon} alt="" /></span>}
                    onClick={() => handleNavigation("/security/biometric")}
                /> */}

                {/* 3. REMEMBER LOGIN (Toggle) */}
                <SettingRow
                    iconSrc={LockIcon}
                    title="Remember Login"
                    control={
                        <ToggleSwitch
                            checked={settings.rememberLogin}
                            onChange={() => toggleSetting("rememberLogin")}
                        />
                    }
                    onClick={() => toggleSetting("rememberLogin")}
                />

                {/* 4. USE FACEID (Toggle - Purple Icon in Image) */}
                {/* Note: Using FingerPrint placeholder, replace with actual FaceID icon if available */}
                {/* <SettingRow
                    iconSrc={FingerPrint} 
                    title="Use FaceID"
                    control={
                        <ToggleSwitch
                            checked={settings.useFaceId}
                            onChange={() => toggleSetting("useFaceId")}
                        />
                    }
                    onClick={() => toggleSetting("useFaceId")}
                /> */}
                
                {/* 5. ACCOUNT RECOVERY (Toggle) */}
                {/* Note: Icon in image is a person with a checkmark, using ProfileAc placeholder */}
                <SettingRow
                    iconSrc={ProfileAc} // PLACEHOLDER: Should be Account Recovery icon
                    title="Account Recovery"
                    control={
                        <ToggleSwitch
                            checked={settings.accountRecovery}
                            onChange={() => toggleSetting("accountRecovery")}
                        />
                    }
                    onClick={() => toggleSetting("accountRecovery")}
                />

                {/* 6. LOG OUT FROM ALL DEVICES (Arrow/Navigation) */}
                <SettingRow
                    iconSrc={LogoutIcon}
                    title="Log Out From All Device"
                    description="Shake your phone to randomize your account balances."
                    control={<span className="text-xl text-gray-400 dark:text-gray-400 font-bold"><img src={chevronRightIcon} alt="" className="dark:invert" /></span>}
                    onClick={handleLogout}
                />

            </div>
        </div>
    );
}

