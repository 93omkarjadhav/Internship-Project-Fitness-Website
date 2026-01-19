import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import CalendarView from './CalendarView';

// ---------------------------
// Types
// ---------------------------

interface OptionItem {
  text: string;
  icon: string;
  action?: string; // LOG_PERIOD_TODAY | CHOOSE_PERIOD_DATE | custom
}

interface OptionsBlock {
  title?: string;
  icon?: string;
  items: OptionItem[];
}

interface CalendarData {
  [key: string]: any;
}

interface ChatBubbleProps {
  message?: string;
  type: 'user' | 'ai';
  time?: string;
  avatar?: string;
  isTyping?: boolean;
  options?: OptionsBlock | null;
  calendarData?: CalendarData | null;

  onOptionSelect?: (text: string) => void;
  onLogPeriod?: () => void;
  onChooseDate?: () => void;
}

// ---------------------------
// Component
// ---------------------------

export default function ChatBubble({
  message,
  type,
  time,
  avatar,
  isTyping,
  options,
  calendarData,
  onOptionSelect,
  onLogPeriod,
  onChooseDate
}: ChatBubbleProps) {
  
  // -------------------------
  // Option Icon
  // -------------------------
  const OptionIcon: React.FC<{ iconPath: string; alt: string }> = ({ iconPath, alt }) => {
    return <img src={iconPath} alt={alt} className="w-4 h-4" />;
  };

  // -------------------------
  // Option Button
  // -------------------------
  const OptionButton: React.FC<{ item: OptionItem }> = ({ item }) => {
    const handleClick = () => {
      if (item.action === 'LOG_PERIOD_TODAY') {
        onLogPeriod?.();
      } else if (item.action === 'CHOOSE_PERIOD_DATE') {
        onChooseDate?.();
      } else {
        onOptionSelect?.(item.text);
      }
    };

    return (
      <button
        onClick={handleClick}
        className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 
                   border border-blue-300 rounded-lg hover:bg-gray-100 transition"
      >
        <OptionIcon iconPath={item.icon} alt={item.text} />
        <span className="text-sm font-medium text-blue-700">{item.text}</span>
      </button>
    );
  };

  // -------------------------
  // Typing Indicator
  // -------------------------
  if (isTyping) {
    return (
      <div className="flex items-start gap-2 justify-start">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt="AI" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-500 rounded-full" />
          )}
        </div>

        <div className="flex gap-1 items-center bg-white px-4 py-3 rounded-lg shadow-sm">
          <span className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
          <span className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    );
  }

  // -------------------------
  // USER bubble
  // -------------------------
  if (type === 'user') {
    return (
      <div className="flex items-start gap-4 justify-end">
        <div className="max-w-xs">
          <div className="bg-blue-700 text-white px-4 py-3 rounded-2xl rounded-tr-lg text-sm leading-relaxed flex flex-col">
            {message}

            {time && (
              <div className="flex items-center gap-1 self-end pt-1 pr-1">
                <span className="text-xs text-white/70">{time}</span>
                <CheckCheck size={16} className="text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt="User" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 rounded-full" />
          )}
        </div>
      </div>
    );
  }

  // -------------------------
  // AI bubble
  // -------------------------
  return (
    <div className="flex items-start gap-2 justify-start">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
        {avatar ? (
          <img src={avatar} alt="AI" className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-500 rounded-full" />
        )}
      </div>

      <div className="max-w-xs">
        <div className="bg-white text-gray-900 px-4 py-3 rounded-2xl rounded-tl-lg text-sm leading-relaxed shadow-sm flex flex-col">
          
          {message}

          {/* Options block */}
          {options?.items && (
            <div className="mt-4 bg-gray-100 p-4 rounded-lg">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <img
                  src={options.icon || '/teamd/help.png'}
                  alt="Options"
                  className="w-4 h-4"
                />
                {options.title || 'Select Options'}
              </h4>

              <div className="my-3 border-t border-gray-300"></div>

              <div className="space-y-2">
                {options.items.map((item) => (
                  <OptionButton key={item.text} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Calendar block */}
          {calendarData && <CalendarView data={calendarData} />}

          {/* Timestamp */}
          {time && (
            <div className="flex items-center gap-1 self-end pt-1 pr-1">
              <span className="text-xs text-gray-500">{time}</span>
              <Check size={16} className="text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
