import React, { useRef, useEffect, type ChangeEvent, useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaChevronRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import ChatInput from "./ChatInput";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";
import { logout } from "../utils/auth";
import { socket } from "../utils/socket";
import { formatTime } from "../utils/formatTime";
import ChatMenuDropdown from "./ChatMenuDropDown";
import ReportUserModal from "./ReportUserModal";
import { toast } from "react-toastify";
import api from "../api/axios";

/* ================= TYPES ================= */

export type Message = {
  text: string;
  sender: "me" | "other";
  time: string;
  id: string; // unique ID for each message
};

export type Conversation = {
  _id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
  messages: Message[];
};

/* ================= CONSTANTS ================= */

const FALLBACK_AVATAR =
  "https://randomuser.me/api/portraits/lego/1.jpg";

/* ================= MESSAGE BUBBLE ================= */

type MessageBubbleProps = {
  msg: Message;
  otherAvatar?: string;
  myAvatar?: string;
};

const MessageBubble = ({ msg, otherAvatar, myAvatar }: MessageBubbleProps) => {
  const isMe = msg.sender === "me";

  return (
    <div className={`flex items-end mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <img
          src={otherAvatar || FALLBACK_AVATAR}
          onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK_AVATAR)}
          alt="User avatar"
          className="h-8 w-8 rounded-full"
        />
      )}

      <div
        className={`max-w-xs px-4 py-2 rounded-lg break-words ${
          isMe
            ? "bg-blue-500 text-white rounded-br-none ml-2"
            : "bg-white text-gray-800 rounded-bl-none mr-2"
        }`}
      >
        <p>{msg.text}</p>
        <div className="text-[10px] text-gray-400 mt-1 text-right">{msg.time}</div>
      </div>

      {isMe && (
        <img
          src={myAvatar || FALLBACK_AVATAR}
          alt="My avatar"
          className="h-8 w-8 rounded-full"
        />
      )}
    </div>
  );
};

/* ================= CHAT ROOM ================= */

type ChatRoomProps = {
  activeChat: Conversation | null;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  loggedInUser: string;
  myAvatar?: string;
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
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const currentChat = conversations.find((c) => c._id === activeChat?._id);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  /* ---------------- SOCKET RECEIVE MESSAGE ---------------- */
  useEffect(() => {
    const handleReceive = (data: any) => {
      const { from, text, createdAt, messageId } = data;
      const time = formatTime(new Date(createdAt));

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === from) {
            // Avoid duplicate
            const exists = conv.messages.some((m) => m.id === messageId);
            if (exists) return conv;

            return {
              ...conv,
              lastMessage: text,
              time,
              messages: [...conv.messages, { text, sender: "other", time, id: messageId }],
            };
          }
          return conv;
        })
      );
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [setConversations]);

  /* ---------------- INPUT ---------------- */
  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = () => {
    if (!message.trim() || !currentChat) return;

    const text = message.trim();
    const time = formatTime();
    const messageId = Date.now().toString(); // simple unique ID

    // Optimistic update
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === currentChat._id
          ? {
              ...conv,
              lastMessage: text,
              time,
              messages: [...conv.messages, { text, sender: "me", time, id: messageId }],
            }
          : conv
      )
    );

    socket.emit("send_message", {
      senderId: loggedInUser,
      receiverId: currentChat._id,
      text,
      messageId, // send unique ID to backend
    });

    setMessage("");
  };

  const handleClearChat = async () => {
    if (!activeChat) return;

    try {
      const token = localStorage.getItem("token");
      const userId = loggedInUser;

      await api.delete(`/messages/clear/${userId}/${activeChat._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Chat cleared successfully!");

      // Clear messages locally
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === activeChat._id ? { ...conv, messages: [], lastMessage: "", time: "" } : conv
        )
      );
    } catch (err) {
      console.error("Clear chat error:", err);
      toast.error("Failed to clear chat");
    }
  }

  
  const handleRemoveFriend = async () => {
    if (!activeChat) return;
  
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/user/friends/remove/${activeChat._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Remove from conversations list
      setConversations((prev) =>
        prev.filter((c) => c._id !== activeChat._id)
      );
  
      // Optionally show toast
      toast.success("Friend removed successfully");
  
    } catch (err) {
      toast.error("Failed to remove friend")
      console.error("Failed to remove friend:", err);
    }
  };
  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  /* ---------------- EMPTY STATE ---------------- */
  if (!currentChat) {
    return (
      <div className="w-[70vw] hidden lg:flex items-center justify-center text-gray-400">
        Select a conversation to start chatting
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="w-[70vw] hidden lg:block">
      {/* HEADER */}
      <div className="h-[16vh] bg-blue-500 flex items-center justify-between px-6 text-white">
      <div className="relative">
        <span
          className="text-2xl cursor-pointer"
          onClick={() => setShowMenu((prev) => !prev)
          }>
          <RxHamburgerMenu />
        </span>

        <ChatMenuDropdown
          isOpen={showMenu}
          onClose={() => setShowMenu(false)}
          onRemoveFriend={handleRemoveFriend}
          onReport={() => setShowReportModal(true)}
          onClearChats={handleClearChat}
        />

      </div>

        <div className="flex items-center gap-3">
          <img
            src={currentChat.avatar || FALLBACK_AVATAR}
            onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK_AVATAR)}
            className="h-10 w-10 rounded-full"
            alt="Chat avatar"
          />
          <span>{currentChat.name}</span>
          <FaChevronRight />
        </div>
      </div>

      {/* MESSAGES */}
      <div className="bg-[#EDF0F9] h-[72vh] flex flex-col justify-between">
        <div className="flex-1 px-10 py-6 overflow-y-auto space-y-4">
          {currentChat.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
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
       
      <ReportUserModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={(reason, details) => {
            console.log(reason, details);

            // call backend API
          }}
        />
    
      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
    </div>
  );
};

export default ChatRoom;
