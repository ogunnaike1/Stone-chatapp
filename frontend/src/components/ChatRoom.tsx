import React, { useRef, useState, useEffect, type ChangeEvent } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaChevronRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import ChatInput from "./ChatInput";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";
import { logout } from "../utils/auth";
import { socket } from "../utils/socket";
import { formatTime } from "../utils/formatTime";

export type Message = {
  text: string;
  sender: "me" | "other";
  time: string;
};

export type Conversation = {
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  messages: Message[];
};

type MessageBubbleProps = {
  msg: Message;
  otherAvatar: string;
  myAvatar: string;
};

const MessageBubble = ({ msg, otherAvatar, myAvatar }: MessageBubbleProps) => {
  const isMe = msg.sender === "me";

  return (
    <div className={`flex items-end mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <img src={otherAvatar} className="h-8 w-8 rounded-full" />
      )}

      <div
        className={`max-w-xs px-4 py-2 rounded-lg break-words ${
          isMe
            ? "bg-blue-500 text-white rounded-br-none ml-2"
            : "bg-white text-gray-800 rounded-bl-none mr-2"
        }`}
      >
        {msg.text}
        <div className="text-[10px] text-gray-400 mt-1 text-right">
          {msg.time}
        </div>
      </div>

      {isMe && (
        <img src={myAvatar} className="h-8 w-8 rounded-full" />
      )}
    </div>
  );
};

type ChatRoomProps = {
  activeChat: Conversation | null;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  loggedInUser: string;
  myAvatar: string;
};

const ChatRoom = ({
  activeChat,
  conversations,
  setConversations,
  loggedInUser,
  myAvatar,
}: ChatRoomProps) => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [openedSidebar, setOpenedSidebar] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentChat = conversations.find(
    (c) => c.name === activeChat?.name
  );

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setMessage(e.target.value);

  /* ✅ SEND MESSAGE */
  const handleSend = () => {
    if (!message.trim() || !currentChat) return;

    const time = formatTime();

    // optimistic update
    setConversations((prev) =>
      prev.map((conv) =>
        conv.name === currentChat.name
          ? {
              ...conv,
              lastMessage: message,
              time,
              messages: [
                ...conv.messages,
                { text: message, sender: "me", time },
              ],
            }
          : conv
      )
    );

    socket.emit("send_message", {
      from: loggedInUser,
      to: currentChat.name,
      text: message,
      time,
    });

    setMessage("");
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  if (!currentChat) {
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
          onClick={() => setOpenedSidebar(true)}
        >
          <RxHamburgerMenu />
        </span>

        <div className="flex items-center gap-3">
          <img
            src={currentChat.avatar}
            className="h-10 w-10 rounded-full"
          />
          <span>{currentChat.name}</span>
          <FaChevronRight />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="bg-[#EDF0F9] h-[72vh] flex flex-col justify-between">
        <div className="flex-1 px-10 py-6 overflow-y-auto space-y-4">
          {currentChat.messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              otherAvatar={currentChat.avatar}
              myAvatar={myAvatar}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          message={message}
          textareaRef={textareaRef}
          handleInput={handleInput}
          onSend={handleSend}
        />
      </div>

      {openedSidebar && (
        <Sidebar onClose={() => setOpenedSidebar(false)} />
      )}

      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  );
};

export default ChatRoom;
