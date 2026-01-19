import React from "react";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmLeaveModal: React.FC<Props> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur Background */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
        <h2 className="text-lg font-semibold mb-6">
          Leave conversation?
        </h2>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Stay
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLeaveModal;
