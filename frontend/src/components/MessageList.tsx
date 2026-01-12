import { useEffect, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import LogoutModal from "./LogoutModal";
import SettingsForm from "./SettingsForm";
import { logout } from "../utils/auth";
import api from "../api/axios";

export interface User {
    _id: string;
    username: string;
    profilePicture?: string;
  }

interface MessageListProps {
    onSelectUser: (user: User) => void; // expects a User
  }


const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";


const MessageList: React.FC<MessageListProps> = ({ onSelectUser }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutOption, setShowLogoutOption] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/user/users");
        setUsers(res.data);
      } catch (error) {
        toast.error("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logout successful");
    setTimeout(() => {
      navigate("/auth/login");
    }, 1000);
  };

  return (
    <div className="lg:w-[30vw] w-full border-r">
      {/* HEADER */}
      <div className="bg-blue-700 pb-4">
        <div className="text-white flex w-[90%] pt-3 mx-auto justify-between">
          <span className="text-xl font-bold">STONECHAT</span>

          <div className="flex gap-4 text-lg cursor-pointer">
            <FaPlus />
            <span onClick={() => setShowSettings(true)}>
              <BsThreeDotsVertical />
            </span>
          </div>
        </div>

        {/* SEARCH */}
        <div className="w-[90%] mx-auto mt-4 bg-white h-10 px-4 flex items-center rounded-2xl">
          <IoMdSearch />
          <input
            className="w-full ml-2 outline-none"
            placeholder="Search for a chat"
          />
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="bg-[#F3F4F6] h-[85vh] overflow-y-auto">
        {loading ? (
          <p className="text-center mt-6 text-gray-500">Loading chats...</p>
        ) : users.length === 0 ? (
          <p className="text-center mt-6 text-gray-500">No users found</p>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="flex justify-between items-center px-4 py-3 hover:bg-gray-200 cursor-pointer border-b"
              onClick={() => onSelectUser(user)}
            >
              <div className="flex gap-3 items-center">
                <img
                  src={
                    user.profilePicture ||
                    DEFAULT_AVATAR
                  }
                  className="h-10 w-10 rounded-full"
                  alt={user.username}
                />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-500 truncate">
                    Tap to start chatting
                  </p>
                </div>
              </div>

              <span className="text-xs text-blue-500">Now</span>
            </div>
          ))
        )}
      </div>

      {/* SETTINGS */}
      {showSettings && (
        <SettingsForm
          onCloseSettings={() => setShowSettings(false)}
          onShowLogout={() => setShowLogoutOption(true)}
        />
      )}

      {/* LOGOUT MODAL */}
      {showLogoutOption && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutOption(false)}
        />
      )}
    </div>
  );
};

export default MessageList;
