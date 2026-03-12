import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatRoom, { type Conversation, type Message } from "../components/ChatRoom";
import MessageList from "../components/MessageList";
import { socket } from "../utils/socket";
import api from "../api/axios";

const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

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

  const [conversations, setConversations]           = useState<Conversation[]>([]);
  const [activeChat, setActiveChat]                 = useState<Conversation | null>(null);
  const [showChatRoomMobile, setShowChatRoomMobile] = useState(false);
  const [loaded, setLoaded]                         = useState(false);

  /* ── LOAD CONVERSATIONS ── */
  useEffect(() => {
    if (!loggedInUserId) return;

    const loadConversations = async () => {
      try {
        const token = localStorage.getItem("token");

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

        const messagesRes = await api.get(`/messages/all/${loggedInUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rawMessages = messagesRes.data;

        const conversationsWithMessages = friends.map((conv) => {
          const convMessages: Message[] = rawMessages
            .filter((msg: any) =>
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
        setLoaded(true);
      } catch (err) {
        console.error(err);
        setLoaded(true);
      }
    };

    loadConversations();
  }, [loggedInUserId]);

  /* ── SOCKET REGISTER ── */
  useEffect(() => {
    if (!loggedInUserId) return;
    socket.emit("register_user", loggedInUserId);
  }, [loggedInUserId]);

  /* ── SOCKET RECEIVE ── */
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

      setConversations(prev =>
        prev.map(conv => {
          if (conv._id !== msg.from && conv._id !== msg.to) return conv;
          if (conv.messages.some(m => m.id === msg.messageId)) return conv;
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
    return () => { socket.off("receive_message", handleReceiveMessage); };
  }, [loggedInUserId]);

  const handleSelectChat = (chat: Conversation) => {
    setActiveChat(chat);
    setShowChatRoomMobile(true);
  };

  const handleBack = () => setShowChatRoomMobile(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070a0f; overflow: hidden; }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          background: "#070a0f",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >

        {/* ══════════════════════════════════════════════
            DESKTOP (lg+)
            Pure Tailwind: "hidden lg:flex" — NO inline display
            MessageList on left | ChatRoom fills the rest
        ══════════════════════════════════════════════ */}
        <div className="hidden lg:flex" style={{ height: "100vh", width: "100%" }}>

          {/* MessageList — 30vw fixed */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "30vw",
              flexShrink: 0,
              height: "100vh",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <MessageList
              conversations={conversations}
              setActiveChat={handleSelectChat}
              activeChatId={activeChat?._id}
            />
          </motion.div>

          {/* ChatRoom — fills remaining width */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ flex: 1, height: "100vh", overflow: "hidden", display: "flex" }}
          >
            <ChatRoom
              activeChat={activeChat}
              conversations={conversations}
              setConversations={setConversations}
              loggedInUser={loggedInUserId ?? ""}
              myAvatar={myAvatar}
            />
          </motion.div>

        </div>

        {/* ══════════════════════════════════════════════
            MOBILE (< lg)
            Pure Tailwind: "block lg:hidden" — NO inline display
            MessageList always visible underneath.
            ChatRoom slides in from right on top.
        ══════════════════════════════════════════════ */}
        <div
          className="block lg:hidden"
          style={{ height: "100vh", width: "100%", position: "relative", overflow: "hidden" }}
        >

          {/* MessageList — pinned underneath as base layer */}
          <div style={{ position: "absolute", inset: 0 }}>
            <MessageList
              conversations={conversations}
              setActiveChat={handleSelectChat}
              activeChatId={activeChat?._id}
            />
          </div>

          {/* ChatRoom — springs in from right, sits above MessageList */}
          <AnimatePresence>
            {showChatRoomMobile && (
              <motion.div
                key="mobile-chatroom"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 32,
                  mass: 0.9,
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 100,
                  background: "#070a0f",
                  willChange: "transform",
                }}
              >
                <ChatRoom
                  activeChat={activeChat}
                  conversations={conversations}
                  setConversations={setConversations}
                  loggedInUser={loggedInUserId ?? ""}
                  myAvatar={myAvatar}
                  onBack={handleBack}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </motion.div>
    </>
  );
};

export default ChatHome;
