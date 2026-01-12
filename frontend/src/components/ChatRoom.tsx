import React, { useState, useRef, useEffect } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaChevronRight } from "react-icons/fa6";
import ChatInput from "./ChatInput";
import Sidebar from "./Sidebar";
import MessageBubble from "./MessageBubble"

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

interface Message {
  sender: "me" | "other";
  text: string;
  time: string;
}

const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

const myAvatar = currentUser?.profilePicture || DEFAULT_AVATAR;

const ChatRoom: React.FC<ChatRoomProps> = ({ selectedUser }) => {
  const [showSideBar, setShowSideBar] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return; // prevent empty messages

    const newMessage: Message = {
      sender: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

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
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">
              Chat with {selectedUser.username} will appear here.
            </p>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  msg={msg}
                  myAvatar={myAvatar}
                  otherAvatar={selectedUser.profilePicture || DEFAULT_AVATAR}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* INPUT */}
        <ChatInput onSend={handleSendMessage} />
      </div>

      {/* SIDEBAR */}
      {showSideBar && <Sidebar onClose={() => setShowSideBar(false)} />}
    </div>
  );
};

export default ChatRoom;
