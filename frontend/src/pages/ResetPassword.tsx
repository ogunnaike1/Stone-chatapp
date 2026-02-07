import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = () => setShow(!show);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        `/user/reset-password/${token}`,
        { password }
      );

      alert("Password reset successful");
      navigate("/auth/login");
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex flex-1 justify-center items-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Reset Password
          </h2>

          <form className="space-y-4" onSubmit={handleReset}>
            {/* Email (optional display only) */}
            <input
              type="email"
              placeholder="Enter email"
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
            />

            {/* New Password */}
            <div className="flex items-center w-full border border-gray-300 rounded-lg focus-within:border-blue-500">
              <input
                type={show ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-4 py-2 focus:outline-none min-w-0"
              />
              <button
                type="button"
                onClick={handleClick}
                className="px-3 text-sm text-blue-600 hover:underline whitespace-nowrap"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="flex items-center w-full border border-gray-300 rounded-lg focus-within:border-blue-500">
              <input
                type={show ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1 px-4 py-2 focus:outline-none min-w-0"
              />
              <button
                type="button"
                onClick={handleClick}
                className="px-3 text-sm text-blue-600 hover:underline whitespace-nowrap"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full !bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
