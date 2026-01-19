import { FiSettings, FiGift, FiLogOut, FiHeart } from "react-icons/fi";
import SidebarItem from "./SideBarItem.tsx";
import UserInfoCard from "./Usercardinfo.tsx";
import { useNavigate } from "react-router-dom";
import sidebarchatImg from "../assets/chatSidebar.jpg";
import Settings from "../assets/sidebar/Setting.png";
import SoundIcon from "../assets/sidebar/SoundIcon.png";
import earnRewards from "../assets/sidebar/earnRewards.png";
import { toast } from "sonner";
import { teamDPath } from "../constants";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    console.log("Signing out...");
    localStorage.removeItem("auth_token");
    toast.success("Signed out successfully");
    navigate("/");
  };
  return (
    <div
      /* UPDATED CLASSES:
         - 'h-full': Keeps it fitting safely inside the mobile drawer.
         - 'md:min-h-screen': Forces it to be at least the full viewport height on desktop.
      */
      className="w-[360px] h-full md:min-h-screen bg-white flex flex-col shadow-lg"
      style={{ borderRadius: "0 20px 20px 0" }}
    >
      {/* User Section */}
      <UserInfoCard name="Dekomori Sanae" />

      {/* Menu Items */}
      <div className="flex flex-col px-5 pt-2 pb-5 gap-1">
        {/* Chat */}
        <SidebarItem
          icon={<img src={sidebarchatImg} alt="Chat" />}
          label="Chat with fitfare AI"
          onClick={() => {
            try {
              // Mark that onboarding should be shown and include a timestamp
              localStorage.setItem('forceShowOnboarding', String(Date.now()));
            } catch (e) {
              // ignore storage errors
            }
            // Dispatch an event so Chat can respond even if already mounted
            try {
              window.dispatchEvent(new CustomEvent('openOnboarding'));
            } catch (e) {
              // ignore
            }
            navigate(teamDPath('ai-chat'));
          }}
        />

        {/* Help */}
        <SidebarItem
          icon={<img src={SoundIcon} alt="Help" />}
          label="Get Help"
        />

        {/* Settings */}
        <SidebarItem
          icon={<img src={Settings} alt="Settings" />}
          label="Settings"
          onClick={() => navigate(teamDPath("settings"))}
        />
        {/* Earn Rewards */}
        <SidebarItem
          icon={<img src={earnRewards} alt="earn rewards" />}
          label="Earn Rewards"
          onClick={() => navigate("#")} 
        />

        <hr className="my-3" />

        {/* Sign Out */}
        <SidebarItem
          icon={<FiLogOut />}
          label="Sign Out"
          onClick={handleSignOut}
          danger={true} 
        />
      </div>

      {/* Footer */}
      <div className="p-5 text-center border-t mt-auto">
        <button 
          className="w-full text-blue-600 text-sm flex items-center justify-center gap-2 mb-2"
        >
          <FiHeart /> Love the app? Rate us
        </button>
        <p className="text-xs text-gray-400">v1.2.224 bugfix6</p>
      </div>
    </div>
  );
}