import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Copy, Share2, ChevronLeft  } from "lucide-react";
import { teamDPath } from "../constants";
import { Link } from "react-router-dom";

const ReferralCode = () => {
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralCode();
  }, []);

  const fetchReferralCode = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/referrals/code`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setReferralCode(data.code);
      }
    } catch (error) {
      console.error("Error fetching referral code:", error);
      toast.error("Failed to load referral code");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const handleShare = () => {
    navigate(teamDPath("invite-friends"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
     <div className="max-w-md mx-auto px-4 pt-4">
  {/* <button
    onClick={() => navigate(-1)}
    className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 transition"
  >
    <ChevronLeft className="w-6 h-6 text-gray-700" />
  </button> */}
  <Link to="/wellness/settings">
  <ChevronLeft className="w-6 h-6 text-gray-700" />
  </Link>
</div>


      <div className="container mx-auto max-w-md px-4 py-6">
        <div className="flex flex-col items-center pt-8">
          <div className="mb-8 w-full max-w-[280px]">
            <img
              src="/gift-illustration.png"
              alt="Gift"
              className="w-full h-auto"
            />
          </div>

          <h1 className="text-[30px] font-bold text-foreground text-center leading-tight mb-12 max-w-[320px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Here's your referral code. Let's share it!
          </h1>

          <div className="w-full mb-6">
            <div className="relative">
              <input
                type="text"
                value={referralCode}
                readOnly
                className="w-full px-6 py-4 text-lg font-small text-foreground bg-white border border-gray-500 rounded-xl text-left"
              />
              <button
                onClick={handleCopy}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="w-full h-14 text-base font-medium rounded-xl flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Share referral
            <Share2 className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralCode;

