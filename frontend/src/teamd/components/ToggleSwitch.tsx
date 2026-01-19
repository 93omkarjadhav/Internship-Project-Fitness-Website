import { ChangeEventHandler } from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export const ToggleSwitch = ({ checked, onChange }: ToggleSwitchProps) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 
      after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
      after:rounded-full after:h-5 after:w-5 after:transition-all 
      peer-checked:after:translate-x-full">
    </div>
  </label>
);
