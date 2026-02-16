import { useEffect, useState } from "react";
import ChatRoom, { type Conversation, type Message } from "../components/ChatRoom";
import MessageList from "../components/MessageList";
import { socket } from "../utils/socket";
import api from "../api/axios";

/* ================= CONSTANTS ================= */
const FALLBACK_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

type SocketMessage = {
  messageId: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
};

const ChatHome = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const loggedInUserId: string | null = user?.id ?? null;
  const myAvatar = user?.profilePicture || FALLBACK_AVATAR;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);

  /* ================= LOAD FRIENDS + MESSAGES ================= */
  useEffect(() => {
    if (!loggedInUserId) return;

    const loadConversations = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1️⃣ Load friends
        const friendsRes = await api.get("/user/friends", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const friends: Conversation[] = friendsRes.data
          .filter((u: any) => u._id !== loggedInUserId)
          .map((u: any) => ({
            _id: u._id,
            name: u.username,
            avatar: u.profilePicture || FALLBACK_AVATAR,
            lastMessage: "",
            time: "",
            messages: [],
          }));

        // 2️⃣ Load all messages
        const messagesRes = await api.get(`/messages/all/${loggedInUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawMessages = messagesRes.data;

        // 3️⃣ Merge messages into friends
        const conversationsWithMessages = friends.map((conv) => {
          const convMessages: Message[] = rawMessages
            .filter(
              (msg: any) =>
                (msg.senderId === loggedInUserId && msg.receiverId === conv._id) ||
                (msg.senderId === conv._id && msg.receiverId === loggedInUserId)
            )
            .map((msg: any) => ({
              id: msg._id,
              text: msg.text,
              sender: msg.senderId === loggedInUserId ? "me" : "other",
              time: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }));

          return {
            ...conv,
            messages: convMessages,
            lastMessage: convMessages.at(-1)?.text || "",
            time: convMessages.at(-1)?.time || "",
          };
        });

        setConversations(conversationsWithMessages);
      } catch (err) {
        console.error("Failed to load conversations/messages:", err);
      }
    };

    loadConversations();
  }, [loggedInUserId]);

  /* ================= SOCKET JOIN ================= */
  useEffect(() => {
    if (!loggedInUserId) return;
    socket.emit("register_user", loggedInUserId);
  }, [loggedInUserId]);

  /* ================= SOCKET RECEIVE MESSAGE ================= */
  useEffect(() => {
    const handleReceiveMessage = (msg: SocketMessage) => {
      const incoming: Message = {
        id: msg.messageId,
        text: msg.text,
        sender: msg.from === loggedInUserId ? "me" : "other",
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id !== msg.from && conv._id !== msg.to) return conv;

          if (conv.messages.some((m) => m.id === msg.messageId)) return conv;

          return {
            ...conv,
            lastMessage: msg.text,
            time: incoming.time,
            messages: [...conv.messages, incoming],
          };
        })
      );
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [loggedInUserId]);

  const handleSelectChat = (chat: Conversation) => setActiveChat(chat);

  return (
    <div className="flex h-screen">
      <ChatRoom
        activeChat={activeChat}
        conversations={conversations}
        setConversations={setConversations}
        loggedInUser={loggedInUserId ?? ""}
        myAvatar={myAvatar}
      />

      <MessageList conversations={conversations} setActiveChat={handleSelectChat} />
    </div>
  );
};

export default ChatHome;