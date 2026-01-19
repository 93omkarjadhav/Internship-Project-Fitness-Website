import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { registerUser } from "../api/api";

interface RegisterResponse {
  data: {
    token: string;
    userId: string;
  };
}

const Register = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Validate gender selection
    if (!gender) {
      setError("Please select your gender");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting registration with:", { email, gender });
      
      // Call API with gender
      const res: RegisterResponse = await registerUser({ email, password, gender });

      console.log("Register response:", res);
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
      localStorage.setItem("userId", String(res.data.userId));

      console.log("Registration successful! Token saved.");

      setLoading(false);
      // Redirect to dashboard after successful registration
      navigate("/");
    } catch (err: any) {
      setLoading(false);

      // Extract error message with better handling
      let msg = "Registration failed. Please try again.";
      
      if (err?.response?.data?.msg) {
        msg = err.response.data.msg;
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      } else if (err?.response?.status === 500) {
        msg = err?.response?.data?.msg || "Server error. Please check the backend console for details and try again.";
      } else if (err?.response?.status === 400) {
        msg = err.response.data?.msg || "Invalid input. Please check your information.";
      }

      setError(msg);
      console.error("Registration error:", err);
      console.error("Error response:", err?.response?.data);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Create Account
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Sign up to start your Fitfare journey.
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
              <FaEnvelope className="text-gray-400 mr-3" />
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
                minLength={6}
                className="w-full outline-none text-gray-700"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-gray-600 text-sm font-medium">Confirm Password</label>
            <div className="flex items-center border rounded-xl p-3 mt-1">
              <FaLock className="text-gray-400 mr-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                required
                minLength={6}
                className="w-full outline-none text-gray-700"
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="text-gray-600 text-sm font-medium mb-2 block">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGender('Female')}
                className={`py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                  gender === 'Female'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-pink-300'
                }`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setGender('Male')}
                className={`py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                  gender === 'Male'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('Other')}
                className={`py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                  gender === 'Other'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                }`}
              >
                Other
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {gender === 'Male' || gender === 'Other' 
                ? '⚠️ Period tracker will not be available for this gender selection'
                : gender === 'Female'
                ? '✓ You will have access to period tracking features'
                : 'Please select your gender to continue'}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating Account..." : "Sign Up →"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-medium">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;

