import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PeriodRestricted from "../pages/PeriodRestricted";

interface PeriodTrackerGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component that checks user gender before allowing access to period tracker features.
 * Redirects Male/Other users to the restricted page.
 */
const PeriodTrackerGuard: React.FC<PeriodTrackerGuardProps> = ({ children }) => {
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
        setUserGender(null);
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

  // Allow access only for Female users or users who haven't set their gender yet
  if (userGender === 'Female' || userGender === null) {
    return <>{children}</>;
  }

  // Block access for Male and Other genders
  return <PeriodRestricted />;
};

export default PeriodTrackerGuard;

