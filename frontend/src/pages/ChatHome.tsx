import { useEffect, useState } from "react";
import MessageList from "../components/MessageList";
import ChatRoom, { type Conversation, type Message } from "../components/ChatRoom";
import { socket } from "../utils/socket";
import api from "../api/axios";

type SocketMessage = {
  from: string;
  to: string;
  text: string;
  createdAt: string;
};

const ChatHome = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const loggedInUserId = user._id;
  const [myAvatar, setMyAvatar] = useState(user.avatar || user.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/user/users", { headers: { Authorization: `Bearer ${token}` } });
        const users: Conversation[] = res.data
          .filter((u: any) => u._id !== loggedInUserId)
          .map((u: any) => ({
            _id: u._id,
            name: u.username,
            avatar: u.profilePicture || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            lastMessage: "",
            time: "",
            messages: [],
          }));
        setConversations(users);
      } catch (err) {
        console.error(err);
      }
    };
    loadUsers();
  }, [loggedInUserId]);

  // Register user socket
  useEffect(() => {
    if (!loggedInUserId) return;
    socket.emit("join", loggedInUserId);
  }, [loggedInUserId]);

  // Receive messages
  useEffect(() => {
    const handleReceiveMessage = (msg: SocketMessage) => {
      const incoming: Message = {
        text: msg.text,
        sender: msg.to === loggedInUserId ? "other" : "me",
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setConversations(prev =>
        prev.map(conv =>
          conv._id === msg.from || conv._id === msg.to
            ? { ...conv, lastMessage: msg.text, time: incoming.time, messages: [...conv.messages, incoming] }
            : conv
        )
      );

      setActiveChat(prev =>
        prev && (prev._id === msg.from || prev._id === msg.to)
          ? { ...prev, lastMessage: msg.text, time: incoming.time, messages: [...prev.messages, incoming] }
          : prev
      );
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => { socket.off("receive_message", handleReceiveMessage); };
  }, [loggedInUserId]);

  // Select chat and load messages
  const handleSelectChat = async (chat: Conversation) => {
    setActiveChat(chat);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/messages/${loggedInUserId}/${chat._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const messages: Message[] = res.data.map((msg: any) => ({
        text: msg.text,
        sender: msg.senderId === loggedInUserId ? "me" : "other",
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));

      setConversations(prev =>
        prev.map(conv =>
          conv._id === chat._id ? { ...conv, messages, lastMessage: messages.at(-1)?.text || "", time: messages.at(-1)?.time || "" } : conv
        )
      );

      setActiveChat(prev => prev ? { ...prev, messages } : prev);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen">
      <ChatRoom
        activeChat={activeChat}
        conversations={conversations}
        setConversations={setConversations}
        loggedInUser={loggedInUserId}
        myAvatar={myAvatar}
      />
      <MessageList conversations={conversations} setActiveChat={handleSelectChat} />
    </div>
  );
};

export default ChatHome;
