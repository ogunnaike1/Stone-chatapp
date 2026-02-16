import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
};

const reasons = [
  "Spam",
  "Harassment or bullying",
  "Fake account",
  "Inappropriate content",
  "Scam or fraud",
  "Other",
];

export default function ReportUserModal({ isOpen, onClose, onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = () => {
    onSubmit(reason, details);
    setStep(3);
  };

  const reset = () => {
    setStep(1);
    setReason("");
    setDetails("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="
            fixed inset-0 z-[200]
            bg-black/40
            flex items-center justify-center
            p-4 sm:p-6
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="
              bg-white
              rounded-2xl
              shadow-xl
              w-full
              max-w-md
              max-h-[90vh]
              overflow-y-auto
              p-5 sm:p-6
            "
          >
            {/* STEP 1 */}
            {step === 1 && (
              <>
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  Report User
                </h2>

                <div className="space-y-2 mb-6">
                  {reasons.map((r) => (
                    <label
                      key={r}
                      className="
                        flex items-center gap-3
                        cursor-pointer
                        p-2
                        rounded-lg
                        hover:bg-gray-100
                        transition
                      "
                    >
                      <input
                        type="radio"
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="w-4 h-4"
                      />

                      <span className="text-sm sm:text-base">
                        {r}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button
                    onClick={reset}
                    className="
                      w-full sm:w-auto
                      px-4 py-2
                      rounded-lg
                      border border-gray-300
                      hover:bg-gray-100
                      transition
                    "
                  >
                    Cancel
                  </button>

                  <button
                    disabled={!reason}
                    onClick={() => setStep(2)}
                    className="
                      w-full sm:w-auto
                      px-4 py-2
                      rounded-lg
                      bg-blue-500
                      text-white
                      hover:bg-blue-600
                      disabled:opacity-50
                      transition
                    "
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  Additional details
                </h2>

                <textarea
                  className="
                    w-full
                    border
                    rounded-lg
                    p-3
                    mb-6
                    resize-none
                    min-h-[120px]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-400
                  "
                  placeholder="Describe what happened..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button
                    onClick={reset}
                    className="
                      w-full sm:w-auto
                      px-4 py-2
                      rounded-lg
                      border border-gray-300
                      hover:bg-gray-100
                      transition
                    "
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSubmit}
                    className="
                      w-full sm:w-auto
                      px-4 py-2
                      rounded-lg
                      bg-red-500
                      text-white
                      hover:bg-red-600
                      transition
                    "
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="text-center py-4">
                <div className="text-green-500 text-4xl mb-3">
                  ✓
                </div>

                <p className="text-sm sm:text-base mb-4">
                  Report submitted successfully
                </p>

                <button
                  onClick={reset}
                  className="
                    w-full sm:w-auto
                    px-4 py-2
                    rounded-lg
                    bg-blue-500
                    text-white
                    hover:bg-blue-600
                    transition
                  "
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}