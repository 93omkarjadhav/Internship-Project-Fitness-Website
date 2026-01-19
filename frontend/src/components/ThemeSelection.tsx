import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface ThemeSelectionProps {
  onComplete?: () => void;
}

const ThemeSelection: React.FC<ThemeSelectionProps> = ({ onComplete }) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleThemeSelect = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Choose Your Theme
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select your preferred appearance mode for the best experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Light Mode Option */}
          <button
            onClick={() => handleThemeSelect('light')}
            className={`
              relative
              p-8
              rounded-2xl
              border-2
              transition-all
              duration-300
              hover:scale-105
              active:scale-95
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
              ${
                theme === 'light'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className={`
                  w-20 h-20
                  rounded-full
                  flex items-center justify-center
                  transition-all duration-300
                  ${
                    theme === 'light'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30'
                      : 'bg-gray-100 dark:bg-gray-600'
                  }
                `}
              >
                <Sun
                  size={40}
                  className={theme === 'light' ? 'text-yellow-600' : 'text-gray-400 dark:text-gray-500'}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  Light Mode
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bright and clean interface
                </p>
              </div>
              {theme === 'light' && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>

          {/* Dark Mode Option */}
          <button
            onClick={() => handleThemeSelect('dark')}
            className={`
              relative
              p-8
              rounded-2xl
              border-2
              transition-all
              duration-300
              hover:scale-105
              active:scale-95
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
              ${
                theme === 'dark'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className={`
                  w-20 h-20
                  rounded-full
                  flex items-center justify-center
                  transition-all duration-300
                  ${
                    theme === 'dark'
                      ? 'bg-indigo-100 dark:bg-indigo-900/30'
                      : 'bg-gray-100 dark:bg-gray-600'
                  }
                `}
              >
                <Moon
                  size={40}
                  className={theme === 'dark' ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  Dark Mode
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Easy on the eyes, especially at night
                </p>
              </div>
              {theme === 'dark' && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </button>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              if (onComplete) {
                onComplete();
              } else {
                navigate('/welcome');
              }
            }}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelection;


