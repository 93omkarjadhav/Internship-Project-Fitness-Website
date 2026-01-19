import { FiChevronRight } from "react-icons/fi";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}

export default function SidebarItem({ icon, label, onClick, danger }: SidebarItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between py-3 px-4 cursor-pointer rounded-lg 
        hover:bg-gray-100 transition`}
    >
      <div className="flex items-center gap-3">

        {/* Icon — stays red when danger */}
        <span className={danger ? "text-red-500" : "text-gray-700"}>
          {icon}
        </span>

        {/* Label — always black when danger */}
        <span className={danger ? "text-black font-medium" : "text-gray-700 font-medium"}>
          {label}
        </span>
      </div>
    </div>
  );
}
