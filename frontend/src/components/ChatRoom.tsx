import React, { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaChevronRight } from "react-icons/fa6";
import ChatInput from "./ChatInput";
import Sidebar from "./Sidebar";

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface ChatRoomProps {
  selectedUser: User | null;
}

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const ChatRoom: React.FC<ChatRoomProps> = ({ selectedUser }) => {
  const [showSideBar, setShowSideBar] = useState(false);

  // If no user is selected, show a placeholder message
  if (!selectedUser) {
    return (
      <div className="w-[70vw] hidden lg:flex items-center justify-center text-gray-400">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div className="w-[70vw] hidden lg:block">
      {/* HEADER */}
      <div className="h-[16vh] bg-blue-500 flex items-center justify-between px-6 text-white">
        <span
          className="text-2xl cursor-pointer"
          onClick={() => setShowSideBar(true)}
        >
          <RxHamburgerMenu />
        </span>

        <div className="flex items-center gap-3">
          <img
            src={selectedUser.profilePicture || DEFAULT_AVATAR}
            className="h-10 w-10 rounded-full"
            alt={selectedUser.username}
          />
          <span className="font-semibold">{selectedUser.username}</span>
          <FaChevronRight />
        </div>
      </div>

      {/* CHAT BODY */}
      <div className="bg-[#EDF0F9] h-[72vh] flex flex-col justify-between">
        {/* MESSAGES */}
        <div className="flex-1 px-10 py-6 overflow-y-auto space-y-4">
          {/* Placeholder for now — messages will be dynamic */}
          <p className="text-gray-500 text-center mt-10">
            Chat with {selectedUser.username} will appear here.
          </p>
        </div>

        {/* INPUT */}
        <ChatInput />
      </div>

      {/* SIDEBAR */}
      {showSideBar && <Sidebar onClose={() => setShowSideBar(false)} />}
    </div>
  );
};

export default ChatRoom;
