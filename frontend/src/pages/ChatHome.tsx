import { useEffect, useState } from "react";
import MessageList from "../components/MessageList";
import ChatRoom, { type Conversation, type Message } from "../components/ChatRoom";
import { socket } from "../utils/socket";
import api from "../api/axios";

/* ================= TYPES ================= */

type SocketMessage = {
  from: string;
  to: string;
  text: string;
  createdAt: string;
};

/* ================= CONSTANTS ================= */

const FALLBACK_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

/* ================= COMPONENT ================= */

const ChatHome = () => {
  /* ---------- USER ---------- */
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

 

  const loggedInUserId: string | null = user?.id ?? null;

 
  const myAvatar = user?.profilePicture || FALLBACK_AVATAR;

  console.log(user.profilePicture)

  /* ---------- STATE ---------- */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    if (!loggedInUserId) return;
  
    const loadAllMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/api/messages/all/${loggedInUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const allMessages: Message[] = res.data.map((msg: any) => ({
          text: msg.text,
          sender: msg.senderId === loggedInUserId ? "me" : "other",
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          id: msg._id, // use MongoDB _id for unique ID
        }));
  
        // Merge messages into conversations
        setConversations((prev) =>
          prev.map((conv) => {
            const convMessages = allMessages.filter(
              (m) =>
                (m.sender === "me" && msg.receiverId === conv._id) ||
                (m.sender === "other" && msg.senderId === conv._id)
            );
  
            return {
              ...conv,
              messages: convMessages,
              lastMessage: convMessages.at(-1)?.text || "",
              time: convMessages.at(-1)?.time || "",
            };
          })
        );
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };
  
    loadAllMessages();
  }, [loggedInUserId, conversations]);
  

  /* ================= SOCKET JOIN ================= */
  useEffect(() => {
    if (!loggedInUserId) return;
    socket.emit("register_user", loggedInUserId);
  }, [loggedInUserId]);
  

  /* ================= RECEIVE MESSAGE ================= */
  useEffect(() => {
    const handleReceiveMessage = (msg: SocketMessage) => {
      const incoming: Message = {
        text: msg.text,
        sender: msg.from === loggedInUserId ? "me" : "other",
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        id: msg.messageId, // unique ID to prevent duplicates
      };
    
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === msg.from || conv._id === msg.to) {
            // Avoid duplicates
            if (conv.messages.some((m) => m.id === msg.messageId)) return conv;
    
            return {
              ...conv,
              lastMessage: msg.text,
              time: incoming.time,
              messages: [...conv.messages, incoming],
            };
          }
          return conv;
        })
      );
    };
    
  
    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [loggedInUserId]);
  

  /* ================= SELECT CHAT ================= */
  const handleSelectChat = async (chat: Conversation) => {
    if (!loggedInUserId) return;

    setActiveChat(chat);

    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        `/api/messages/${loggedInUserId}/${chat._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const messages: Message[] = res.data.map((msg: any) => ({
        text: msg.text,
        sender: msg.senderId === loggedInUserId ? "me" : "other",
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === chat._id
            ? {
                ...conv,
                messages,
                lastMessage: messages.at(-1)?.text || "",
                time: messages.at(-1)?.time || "",
              }
            : conv
        )
      );

      setActiveChat((prev) =>
        prev ? { ...prev, messages } : prev
      );
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="flex h-screen">
      <ChatRoom
        activeChat={activeChat}
        conversations={conversations}
        setConversations={setConversations}
        loggedInUser={loggedInUserId ?? ""}
        myAvatar={myAvatar}
      />

      <MessageList
        conversations={conversations}
        setActiveChat={handleSelectChat}
      />
    </div>
  );
};

export default ChatHome;
