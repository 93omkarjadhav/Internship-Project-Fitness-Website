import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', size = 20 }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative
        p-2
        rounded-full
        transition-all
        duration-300
        hover:scale-110
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        ${theme === 'dark' 
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Currently in ${theme === 'light' ? 'light' : 'dark'} mode - Click to switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun
          size={size}
          className={`
            absolute
            transition-all
            duration-300
            ${theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-0'
            }
          `}
        />
        <Moon
          size={size}
          className={`
            absolute
            transition-all
            duration-300
            ${theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
            }
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;

