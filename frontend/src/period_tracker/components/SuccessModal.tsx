import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  onPrimary: () => void;
  onClose: () => void;
}

export const SuccessModal = ({ onPrimary, onClose }: SuccessModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-card rounded-3xl max-w-sm w-full p-8 relative">
        {/* Illustration */}
        <div className="mb-6">
          <div className="w-full aspect-[4/3] bg-[#E8EEF4] rounded-3xl flex items-center justify-center overflow-hidden">
            <img 
              src="/success-illustration.jpg" 
              alt="Cycle logged successfully" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-center mb-2">Cycle logged!</h2>
        <p className="text-center text-muted-foreground mb-6">
          Congratulations! You've successfully logged your cycle today.
        </p>

        {/* Primary Button */}
        <div className="flex justify-center">
          <button
            onClick={onPrimary}
            className="rounded-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white px-4 py-2.5 h-auto flex items-center justify-center gap-2 font-medium transition-colors"
          >
            Great, thanks
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Close Button - Below the modal */}
      <button
        onClick={onClose}
        className="w-14 h-14 rounded-full bg-white flex items-center justify-center mt-6 shadow-lg hover:bg-gray-100 transition-colors"
      >
        <X className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  );
};
