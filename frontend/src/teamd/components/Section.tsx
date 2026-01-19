import { ReactNode } from "react";
import chevronRightIcon from "../assets/SettingPage/chevron right.png";

interface SectionItem {
  icon?: ReactNode;
  label: string;
  rightIcon?: ReactNode;
  onClick?: () => void;
}

interface SectionProps {
  title: string;
  items: SectionItem[];
}

export default function Section({ title, items }: SectionProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">{title}</h3>

      <div className="bg-white rounded-2xl shadow-sm divide-y">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center space-x-3">
              <span className="text-blue-500 text-lg">{item.icon}</span>
              <span className="text-gray-700 font-medium">{item.label}</span>
            </div>

            <span className="text-gray-400">
              {item.rightIcon ? (
                item.rightIcon
              ) : (
                <img
                  src={chevronRightIcon}
                  alt="arrow"
                  className="w-4 h-4 opacity-70"
                />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
