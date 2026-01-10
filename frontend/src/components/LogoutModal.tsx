import { motion } from "framer-motion";

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal = ({ onConfirm, onCancel }: LogoutModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white w-full max-w-sm rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold text-gray-800 text-center">
          Log out
        </h2>

        <p className="text-sm text-gray-500 text-center mt-2">
          Do you want to log out?
        </p>

        <div className="flex justify-between mt-6 gap-3">
          <button
            onClick={onCancel}
            className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            No
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Yes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LogoutModal;
