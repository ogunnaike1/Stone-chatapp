import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserMinus } from "react-icons/fa6";
import { MdReport } from "react-icons/md";
import { AiOutlineClear } from "react-icons/ai"; // icon for Clear Chats

type ChatMenuDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  onRemoveFriend?: () => void;
  onReport?: () => void;
  onClearChats?: () => void; // new prop
};

const ChatMenuDropdown = ({
    isOpen,
    onClose,
    onRemoveFriend,
    onReport,
    onClearChats,
  }: ChatMenuDropdownProps) => {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
  
    // Close on outside click
  
    const confirmRemove = () => {
      onRemoveFriend?.();
      setShowRemoveConfirm(false);
      onClose();
    };
  
    const confirmClear = () => {
      onClearChats?.();
      setShowClearConfirm(false);
      onClose();
    };
  
    return (
      <>
        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
            >
              {/* Remove Friend */}
              <button
                onClick={() =>{ 
                    onClose();
                    setShowRemoveConfirm(true)}
                } 
                className="w-full flex items-center gap-3 px-4 py-3 text-blue-700 hover:bg-red-50 hover:text-red-500 transition"
              >
                <FaUserMinus className="text-lg" />
                <span className="font-medium">Remove Friend</span>
              </button>
  
              <div className="h-[1px] bg-gray-100" />
  
              {/* Clear Chats */}
              <button
                onClick={() =>{
                    onClose();
                    setShowClearConfirm(true)
                } }
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <AiOutlineClear className="text-lg" />
                <span className="font-medium">Clear Chats</span>
              </button>
  
              <div className="h-[1px] bg-gray-100" />
  
              {/* Report */}
              <button
                onClick={() => {
                  onClose();
                  onReport?.();
                 
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-yellow-50 hover:text-yellow-600 transition"
              >
                <MdReport className="text-lg" />
                <span className="font-medium">Report</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
  
        {/* Remove Friend Modal */}
        <AnimatePresence>
          {showRemoveConfirm && (
            <motion.div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-[320px] p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Remove Friend
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove this friend?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowRemoveConfirm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                  >
                    No
                  </button>
                  <button
                    onClick={confirmRemove}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Yes, Remove
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
  
        {/* Clear Chat Modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl w-[320px] p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Clear Chat
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to clear all messages in this chat?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                  >
                    No
                  </button>
                  <button
                    onClick={confirmClear}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Yes, Clear
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

export default ChatMenuDropdown;