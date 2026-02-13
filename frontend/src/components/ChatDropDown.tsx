import { motion, AnimatePresence } from "framer-motion";
import { FaUserPlus, FaCog, FaSignOutAlt } from "react-icons/fa";

type ChatDropdownProps = {
  isOpen: boolean;
  onFindFriends: () => void;
  onSettings: () => void;
  onLogout: () => void;
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.15,
    },
  },
};

const ChatDropdown = ({
  isOpen,
  onFindFriends,
  onSettings,
  onLogout,
}: ChatDropdownProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="
            absolute right-0 top-12 z-50
            w-48 rounded-xl bg-white shadow-lg
            border overflow-hidden
          "
        >
          <button
            onClick={onFindFriends}
            className="flex items-center gap-3 text-blue-600 cursor-pointer w-full px-4 py-3 text-sm hover:bg-gray-100"
          >
            <FaUserPlus />
            Find Friends
          </button>

          <button
            onClick={onSettings}
            className="flex items-center gap-3 text-blue-600 cursor-pointer w-full px-4 py-3 text-sm hover:bg-gray-100"
          >
            <FaCog />
            Settings
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 cursor-pointer text-sm text-red-600 hover:bg-red-50"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatDropdown;
