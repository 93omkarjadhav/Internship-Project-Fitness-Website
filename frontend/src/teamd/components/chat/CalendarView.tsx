import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// ---------------------------
// Types
// ---------------------------

interface CalendarData {
  daysLeft?: string | number;
  nextPeriodDate?: string;
  icon?: string;
  highlightDate?: string;
  periodLength?: number;
}

type CalendarMode = "display" | "picker";

interface CalendarViewProps {
  data?: CalendarData | null;
  mode?: CalendarMode;
  onClose?: () => void;
  onDateSelect?: (date: string) => void;
}

interface DateCellProps {
  day: number | null;
}

// ---------------------------
// Component
// ---------------------------

export default function CalendarView({
  data,
  mode = "display",
  onClose,
  onDateSelect
}: CalendarViewProps) {

  const [pickerDate, setPickerDate] = useState<Date>(new Date());

  const displayDate =
    mode === "picker"
      ? pickerDate
      : data?.highlightDate
      ? new Date(data.highlightDate)
      : new Date();

  const {
    daysLeft = "N/A",
    nextPeriodDate = "No data",
    icon,
    highlightDate,
    periodLength = 5
  } = data || {};

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const currentMonth = displayDate.getMonth();
  const currentYear = displayDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const blanks = Array(firstDayOfMonth).fill(null);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  let highlightStart: Date | null = null;
  let highlightEnd: Date | null = null;

  if (mode === "display" && highlightDate) {
    highlightStart = new Date(highlightDate);
    highlightStart.setHours(0, 0, 0, 0);

    highlightEnd = new Date(highlightStart);
    highlightEnd.setDate(highlightStart.getDate() + periodLength - 1);
  }

  // ---------------------------
  // DateCell Component
  // ---------------------------
  const DateCell: React.FC<DateCellProps> = ({ day }) => {
    if (day === null) return <div className="w-8 h-8"></div>;

    let styles = "w-8 h-8 flex items-center justify-center text-sm rounded-full";
    const isClickable = mode === "picker";

    // Picker Mode
    if (mode === "picker") {
      const dayDate = new Date(currentYear, currentMonth, day);
      const pickerNorm = new Date(pickerDate);
      pickerNorm.setHours(0, 0, 0, 0);

      if (dayDate.getTime() === pickerNorm.getTime()) {
        styles += " bg-blue-600 text-white";
      } else {
        styles += " text-gray-700 hover:bg-gray-200 cursor-pointer";
      }
    }

    // Display Mode
    if (mode === "display") {
      let isHighlighted = false;

      if (highlightStart && highlightEnd) {
        const dayDate = new Date(currentYear, currentMonth, day);

        if (dayDate.getTime() === highlightStart.getTime()) {
          styles += " bg-red-500 text-white";
          isHighlighted = true;
        } else if (dayDate > highlightStart && dayDate <= highlightEnd) {
          styles += " bg-red-100 text-red-500";
          isHighlighted = true;
        }
      }

      if (!isHighlighted) styles += " text-gray-700";
    }

    const handleClick = () => {
      if (!isClickable) return;
      setPickerDate(new Date(currentYear, currentMonth, day));
    };

    return (
      <div className={styles} onClick={handleClick}>
        {day}
      </div>
    );
  };

  // ---------------------------
  // Month Navigation (Picker Only)
  // ---------------------------

  const goToPrevMonth = () => {
    const newDate = new Date(pickerDate);
    newDate.setMonth(pickerDate.getMonth() - 1);
    setPickerDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(pickerDate);
    newDate.setMonth(pickerDate.getMonth() + 1);
    setPickerDate(newDate);
  };

  const handleConfirm = () => {
    if (!onDateSelect) return;
    const formatted = pickerDate.toISOString().split("T")[0];
    onDateSelect(formatted);
  };

  // ---------------------------
  // Render
  // ---------------------------

  return (
    <div className={`mt-4 ${mode === "picker" ? "bg-white" : "bg-gray-50"} p-4 rounded-lg shadow-lg`}>

      {/* Header */}
      <div className="flex items-center gap-2">
        <img
          src={icon || "/ovary.png"}
          alt="Period"
          className="w-5 h-5"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/20x20/F0F0F0/AAAAAA?text=i";
          }}
        />
        <h4 className="text-sm font-semibold text-gray-900">
          {mode === "picker" ? "Select Start Date" : "Period"}
        </h4>
      </div>

      <div className="my-3 border-t border-gray-200"></div>

      {/* Display Mode Details */}
      {mode === "display" ? (
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900">{daysLeft}</p>
          <p className="text-sm text-gray-600">{nextPeriodDate}</p>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <button onClick={goToPrevMonth} className="p-1 rounded-full hover:bg-gray-100">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p className="text-lg font-semibold text-gray-900">
            {displayDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric"
            })}
          </p>
          <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-gray-100">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {mode === "display" && <div className="mb-4 border-t border-gray-200"></div>}

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {daysOfWeek.map((day, i) => (
          <div key={`day-${i}`} className="text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}

        <div className="col-span-7 border-b border-gray-200 pt-2"></div>

        {blanks.map((_, i) => (
          <DateCell key={`blank-${i}`} day={null} />
        ))}

        {daysArray.map((day) => (
          <DateCell key={day} day={day} />
        ))}
      </div>

      {/* Footer Buttons */}
      <div className="mt-4 border-t border-gray-200">
        {mode === "display" ? (
          <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 pt-3 pb-1">
            <Link to="/period/dashboard">View Details</Link>
          </button>
        ) : (
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
