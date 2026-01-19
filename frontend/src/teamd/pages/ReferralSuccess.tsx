import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { teamDPath } from "../constants";

const ReferralSuccess = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(teamDPath("invite-friends"));
  };

  return (
    <div className="fixed inset-0 bg-[#3a4552] flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-[340px]">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[240px] mb-6">
              <img
                src="/envelope-illustration.png"
                alt="Envelope"
                className="w-full h-auto"
              />
            </div>

            <h1 className="text-3xl font-bold text-foreground text-center mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Referral invitation sent!
            </h1>

            <p className="text-base text-muted-foreground text-center font-normal leading-relaxed mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Your friend will receive an invitation to join FitFare. You'll earn rewards once they sign up!
            </p>

            <button
              onClick={handleClose}
              className="w-full h-14 text-base font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center"
            >
              Great, thanks!
              <Check className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="mx-auto mt-6 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <X className="w-6 h-6 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ReferralSuccess;

