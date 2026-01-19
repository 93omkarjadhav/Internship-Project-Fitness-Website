import { useState, useEffect } from "react";
import axios from "axios";

export const useUserGender = () => {
  const [userGender, setUserGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserGender = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserGender(response.data.user?.gender || null);
      } catch (error) {
        console.error("Error fetching user gender:", error);
        setUserGender(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGender();
  }, []);

  return { userGender, loading };
};

