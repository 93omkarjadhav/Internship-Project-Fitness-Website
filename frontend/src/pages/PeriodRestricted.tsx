import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const PeriodRestricted = () => {
  const navigate = useNavigate();
  const [userGender, setUserGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserGender = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const gender = response.data.user?.gender;
        setUserGender(gender);
      } catch (error) {
        console.error("Error fetching user gender:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGender();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const genderText = userGender === "Male" ? "male" : userGender === "Other" ? "other" : "this gender";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Period Tracker Not Available
          </h1>
          <p className="text-gray-600">
            The period tracker feature is not available for {genderText} users.
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate("/welcome")}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeriodRestricted;

