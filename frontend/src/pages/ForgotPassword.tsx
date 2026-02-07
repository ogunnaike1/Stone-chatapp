import { useState } from "react";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import { FaEnvelope, FaArrowLeft, FaPhone } from "react-icons/fa";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/forgot-password", { email });
      alert("Check your email for reset link");
      setEmail("");
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl ">
        <div className="bg-white shadow-md rounded-lg p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Forgot Password?
              </h2>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Please select an option to send the reset password link
              </p>
            </div>

            {/* Reset via Email */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">
                    <FaEnvelope />
                  </span>
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm sm:text-base">
                    Reset via Email
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    We will send you a link to reset your password
                  </p>
                </div>
              </div>

              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Reset via SMS (UI only for now) */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-green-500 w-14 h-14 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">
                    <FaPhone />
                  </span>
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm sm:text-base">
                    Reset via SMS
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    We will send you a link to reset your password
                  </p>
                </div>
              </div>

              <div className="flex">
                <span className="bg-gray-200 border border-gray-300 rounded-l-md px-3 flex items-center text-sm sm:text-base">
                  +234
                </span>
                <input
                  type="tel"
                  placeholder="(123)-456-7890"
                  className="flex-1 border border-l-0 border-gray-300 px-3 py-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full !bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Link Reset Password"}
            </button>

            {/* Back to Login */}
            <div className="flex items-center justify-center gap-2">
              <RouterLink
                to="/auth/login"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <span className="text-sm">
                  <FaArrowLeft />
                </span>
                <span className="text-sm sm:text-base">Back to Login</span>
              </RouterLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
