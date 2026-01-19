import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { forgotPassword, resetPassword } from "../api/api";

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await forgotPassword({ email });
      setSuccess(res.data.msg || "Password reset link sent to your email!");
      setStep("reset");
    } catch (err: any) {
      let msg = "Failed to send reset email. Please try again.";
      
      if (err?.response?.data?.msg) {
        msg = err.response.data.msg;
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const res = await resetPassword({ email, token: resetToken, newPassword });
      setSuccess(res.data.msg || "Password reset successfully! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      let msg = "Failed to reset password. Please try again.";
      
      if (err?.response?.data?.msg) {
        msg = err.response.data.msg;
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
          {step === "email" ? "Forgot Password?" : "Reset Password"}
        </h2>
        <p className="text-gray-500 text-center mb-6">
          {step === "email"
            ? "Enter your email to receive a password reset token."
            : "Enter the token sent to your email and your new password."}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-center">
            {success}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all ${
                loading ? "bg-gray-400 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending..." : "Send Reset Token →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-5">
            <div>
              <label className="text-gray-600 text-sm font-medium">Reset Token</label>
              <div className="flex items-center border rounded-xl p-3 mt-1">
                <FaLock className="text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Enter token from email"
                  value={resetToken}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setResetToken(e.target.value)
                  }
                  required
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-600 text-sm font-medium">New Password</label>
              <div className="flex items-center border rounded-xl p-3 mt-1">
                <FaLock className="text-gray-400 mr-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewPassword(e.target.value)
                  }
                  required
                  minLength={6}
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all ${
                loading ? "bg-gray-400 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Resetting..." : "Reset Password →"}
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to email step
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Remember your password?{" "}
          <a href="/login" className="text-blue-600 font-medium">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

