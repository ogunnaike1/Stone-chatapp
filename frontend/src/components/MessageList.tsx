import React, { useState, useMemo } from "react";
import { IoMdSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import LogoutModal from "./LogoutModal";
import { logout } from "../utils/auth";
import type { Conversation } from "./ChatRoom";
import SettingsForm from "./SettingsForm";

type MessageListProps = {
  conversations: Conversation[];
  setActiveChat: (chat: Conversation) => void;
};

const MessageList = ({ conversations, setActiveChat }: MessageListProps) => {
  const [showLogout, setShowLogout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  /**
   * ✅ Filter and sort conversations by search term and latest message time
   */
  const sortedConversations = useMemo(() => {
    return [...conversations]
      .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      });
  }, [conversations, searchTerm]);

  return (
    <div className="lg:w-[30vw] w-full border-r">
      {/* HEADER */}
      <div className="bg-blue-700 pb-4">
        <div className="text-white flex w-[90%] pt-3 mx-auto justify-between items-center">
          <span className="text-xl font-bold">STONECHAT</span>

          <div className="flex gap-4 text-lg cursor-pointer">
            <FaPlus />
            <button onClick={() =>  setShowSettings(true)}>
              <BsThreeDotsVertical />
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="w-[90%] mx-auto mt-4 bg-white h-10 px-4 flex items-center rounded-2xl">
          <IoMdSearch className="text-gray-400 text-lg" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ml-2 outline-none text-sm"
            placeholder="Search for a chat"
          />
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="bg-[#F3F4F6] h-[85vh] overflow-y-auto">
        {sortedConversations.length > 0 ? (
          sortedConversations.map(user => (
            <div
              key={user.name}
              onClick={() => setActiveChat(user)}
              className="flex justify-between items-center px-4 py-3 hover:bg-gray-200 cursor-pointer border-b"
            >
              <div className="flex gap-3 items-center">
                <img
                  src={user.avatar}
                  className="h-10 w-10 rounded-full object-cover"
                  alt={user.name}
                />
                <div className="overflow-hidden">
                  <p className="font-semibold truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate max-w-[150px]">
                    {user.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>

              <span className="text-xs text-blue-500 whitespace-nowrap">
                {user.time || ""}
              </span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 mt-4">
            No chats found
          </p>
        )}
      </div>

      {/* LOGOUT MODAL */}
      {showSettings && (
        <SettingsForm onCloseSettings={()=>setShowSettings(false)} onShowLogout={()=> setShowLogout(true)}        
        />
      )}

        {showLogout && (
        <LogoutModal onConfirm={handleLogout} 
        onCancel={()=>setShowLogout(false)} />
      )}
    </div>
  );
};

export default MessageList;
