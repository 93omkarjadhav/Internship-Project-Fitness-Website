import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      console.error("Google OAuth error:", error);
      toast.error("Google sign-in failed. Please try again.");
      navigate("/");
      return;
    }

    if (token) {
      console.log("Google sign-in successful, token received");
      // Set token in localStorage
      localStorage.setItem("auth_token", token);
      
      // Verify token was set
      const storedToken = localStorage.getItem("auth_token");
      if (storedToken === token) {
        toast.success("Signed in with Google successfully!");
        // Use window.location for a full page reload to ensure PrivateRoutes sees the token
        window.location.href = "/welcome";
      } else {
        console.error("Failed to store token in localStorage");
        toast.error("Failed to save authentication token");
        navigate("/");
      }
    } else {
      console.error("No token received from Google OAuth");
      toast.error("Google sign-in failed. No token received.");
      navigate("/");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium">Signing in with Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;

