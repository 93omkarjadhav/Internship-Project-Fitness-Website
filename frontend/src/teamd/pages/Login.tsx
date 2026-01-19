import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { loginUser } from "../api/api"; // Must return { data: { token: string; userId: string } }

interface LoginResponse {
  data: {
    token: string;
    userId: string;
  };
}

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", { email });
      
      // Call API (correctly typed)
      const res: LoginResponse = await loginUser({ email, password });

      console.log("Login response:", res);
      console.log("Response data:", res.data);

      // Check if token and userId exist
      if (!res.data.token) {
        throw new Error("No token received from server");
      }
      if (!res.data.userId) {
        throw new Error("No userId received from server");
      }

      // Save auth credentials
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", String(res.data.userId)); // Ensure it's a string

      console.log("Login successful! Token saved.");

      setLoading(false);
      navigate("/"); // Dashboard redirect

    } catch (err: any) {
      setLoading(false);

      // Extract error message with better handling
      let msg = "Login failed. Please check your credentials.";
      
      if (err?.response?.data?.msg) {
        msg = err.response.data.msg;
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      } else if (err?.response?.status === 500) {
        msg = "Server error. Please try again later or contact support.";
      } else if (err?.response?.status === 401) {
        msg = "Invalid credentials. Please check your email and password.";
      }

      setError(msg);
      console.error("Login error:", err);
      console.error("Error response:", err?.response?.data);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Welcome Back!
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Sign in to continue to your Fitfare account.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-gray-600 text-sm font-medium">Email</label>
            <div className="flex items-center border rounded-xl p-3 mt-1">
              <FaUser className="text-gray-400 mr-3" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
                className="w-full outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-600 text-sm font-medium">Password</label>
            <div className="flex items-center border rounded-xl p-3 mt-1">
              <FaLock className="text-gray-400 mr-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                className="w-full outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing In..." : "Sign In →"}
          </button>
        </form>

        <div className="text-center space-y-2 mt-6">
          <p className="text-gray-500 text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 font-medium hover:underline">
              Sign Up
            </a>
          </p>
          <p className="text-gray-500 text-sm">
            <a href="/forgot-password" className="text-blue-600 font-medium hover:underline">
              Forgot Password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
