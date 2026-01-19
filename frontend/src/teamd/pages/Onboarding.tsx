import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [page, setPage] = useState<number>(1);

  return (
    <div className="min-h-screen bg-white font-Plus Jakarta Sans">

      {page === 1 ? (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 pb-8">
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="mb-12">
              <img
                src="/Onboarding.png"
                alt="AI Health Assistant"
                className="w-64 h-64"
              />
            </div>

            <div className="text-center max-w-sm mb-8">
              <h1 className="text-4xl font-bold text-black mb-6 leading-tight">
                Your empathic AI health assistant is here.
              </h1>
              <p className="text-base text-gray-400">
                Meet fitfare AI, your next-generation health assistant made to improve health
              </p>
            </div>
          </div>

          <button
            onClick={() => setPage(2)}
            className="w-96 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            Get Started
            <ChevronRight size={25} />
          </button>

        </div>
      ) : (

        <div className="flex flex-col items-center justify-center min-h-screen px-6 pb-8">
          
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">

            <h1 className="text-3xl font-bold text-black text-center mb-12">
              Precautions & Limitations
            </h1>

            <div className="space-y-4 w-full mb-12">

              {/* Card 1 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <img src="/stethoscope.png" alt="Stethoscope" className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Not a Substitute for Medical Advice
                  </h3>
                  <p className="text-sm text-gray-600">
                    FitFare AI is not a substitute for medical advice - it's just an assistant.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <img src="/processor.png" alt="Chip" className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Information is Limited
                  </h3>
                  <p className="text-sm text-gray-600">
                    Our LLM is trained on existing datasets, so it may not know recent info.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <img src="/tarhet.png" alt="Target" className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Data Accuracy
                  </h3>
                  <p className="text-sm text-gray-600">
                    Recommendations depend on the accuracy of your inputs and synced data.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-96 max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            Continue
            <ChevronRight size={20} />
          </button>

        </div>
      )}
    </div>
  );
}
