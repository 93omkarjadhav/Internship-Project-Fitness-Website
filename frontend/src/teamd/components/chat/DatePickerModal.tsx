import React from 'react';
import CalendarView from './CalendarView';

// ----------------------------
// Types
// ----------------------------
interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
}

// ----------------------------
// Component
// ----------------------------
export default function DatePickerModal({
  isOpen,
  onClose,
  onDateSelect
}: DatePickerModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <CalendarView
        mode="picker"
        onClose={onClose}
        onDateSelect={onDateSelect}
      />
    </div>
  );
}
