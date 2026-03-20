import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatRoom, { type Conversation, type Message } from "../components/ChatRoom";
import MessageList from "../components/MessageList";
import { socket } from "../utils/socket";
import api from "../api/axios";
import LoadingScreen from "../components/LoadingScreen";
import { useNotification } from "../components/NotificationContext";

const FALLBACK_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

type SocketMessage = {
  messageId: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
  attachments?: {           // ← add this
    type: "image" | "video" | "document";
    url: string;
    name: string;
    sizeLabel?: string;
  }[];
};

type FriendRequest = {
  fromId: string;
  fromName: string;
  fromAvatar: string | null;
};

const sortConversations = (convs: Conversation[]): Conversation[] =>
  [...convs].sort((a, b) => {
    if (!a.rawTime && !b.rawTime) return 0;
    if (!a.rawTime) return 1;
    if (!b.rawTime) return -1;
    return new Date(b.rawTime).getTime() - new Date(a.rawTime).getTime();
  });

const ChatHome = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const loggedInUserId: string | null = user?.id ?? null;
  const myAvatar = user?.profilePicture || FALLBACK_AVATAR;

  const { notify } = useNotification();

  const [conversations, setConversations]           = useState<Conversation[]>([]);
  const [activeChat, setActiveChat]                 = useState<Conversation | null>(null);
  const [chatLoading, setChatLoading]               = useState(false);
  const [showChatRoomMobile, setShowChatRoomMobile] = useState(false);
  const [loaded, setLoaded]                         = useState(false);
  const [unreadCounts, setUnreadCounts]             = useState<Record<string, number>>({});
  const [pendingRequests, setPendingRequests]       = useState(0);

  // useRef — always holds the latest value, readable inside any socket
  // closure without going stale. useCallback does NOT solve this.
  const activeChatIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    activeChatIdRef.current = activeChat?._id;
  }, [activeChat]);

  // Keeps a mirror of conversations for reading inside socket handlers
  // without needing conversations in the socket effect's dep array
  const conversationsRef = useRef<Conversation[]>([]);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

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
            rawTime: "",
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
              time: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              rawTime: msg.createdAt,
            }));

          const lastMsg = convMessages.at(-1);
          return {
            ...conv,
            messages: convMessages,
            lastMessage: lastMsg?.text || "",
            time: lastMsg?.time || "",
            rawTime: (lastMsg as any)?.rawTime || "",
          };
        });

        setConversations(sortConversations(conversationsWithMessages));
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
    socket.connect();             // ← connect only after login
    socket.emit("register_user", loggedInUserId);
  }, [loggedInUserId]);

  /* ── SOCKET: RECEIVE MESSAGE ── */
  useEffect(() => {
    const handleReceiveMessage = (msg: SocketMessage) => {
      // Only handle messages sent by someone else
      if (msg.from === loggedInUserId) return;

      const displayTime = new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit",
      });

      const incoming: Message = {
        id: msg.messageId,
        text: msg.text,
        sender: "other",
        time: displayTime,
        attachments: msg.attachments ?? [],  // ← add this
      };

      // Read sender name from the ref — avoids a second setState call
      const senderName = conversationsRef.current.find(c => c._id === msg.from)?.name ?? "New message";

      // One single setState — update + re-sort in one pass
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv._id !== msg.from) return conv;
          if (conv.messages.some(m => m.id === msg.messageId)) return conv; // dedupe
          return {
            ...conv,
            lastMessage: msg.text || `📎 ${msg.attachments?.[0]?.name ?? "File"}`,
            time: displayTime,
            rawTime: msg.createdAt,
            messages: [...conv.messages, incoming],
          };
        });
        return sortConversations(updated);
      });

      // Read the ref directly — always current, never stale
      const isOpenChat = activeChatIdRef.current === msg.from;

      if (!isOpenChat) {
        setUnreadCounts(prev => ({
          ...prev,
          [msg.from]: (prev[msg.from] || 0) + 1,
        }));

        notify({
          type: "info",
          title: senderName,
          message: msg.text.length > 60 ? msg.text.slice(0, 60) + "…" : msg.text,
        });
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => { socket.off("receive_message", handleReceiveMessage); };
    // activeChatIdRef + conversationsRef are refs — stable, no need in deps
  }, [loggedInUserId, notify]);

  /* ── SOCKET: FRIEND REQUEST RECEIVED ── */
  useEffect(() => {
    const handleFriendRequest = (req: FriendRequest) => {
      setPendingRequests(p => p + 1);
      notify({
        type: "info",
        title: "Friend Request",
        message: `${req.fromName} sent you a friend request`,
      });
    };
    socket.on("friend_request_received", handleFriendRequest);
    return () => { socket.off("friend_request_received", handleFriendRequest); };
  }, [notify]);

  /* ── SOCKET: FRIEND REQUEST ACCEPTED ── */
  useEffect(() => {
    const handleRequestAccepted = (data: { byId: string; byName: string; byAvatar: string | null }) => {
      notify({
        type: "success",
        title: "Friend Request Accepted",
        message: `${data.byName} accepted your friend request!`,
      });
      const newConv: Conversation = {
        _id: data.byId,
        name: data.byName,
        avatar: data.byAvatar || FALLBACK_AVATAR,
        lastMessage: "",
        time: "",
        rawTime: "",
        messages: [],
      };
      setConversations(prev => {
        if (prev.some(c => c._id === data.byId)) return prev;
        return sortConversations([...prev, newConv]);
      });
    };
    socket.on("friend_request_accepted", handleRequestAccepted);
    return () => { socket.off("friend_request_accepted", handleRequestAccepted); };
  }, [notify]);

  /* ── SELECT CHAT ── */
  const handleSelectChat = (chat: Conversation) => {
    if (activeChat?._id === chat._id) return;
    setActiveChat(chat);
    setChatLoading(true);
    setShowChatRoomMobile(true);
    setUnreadCounts(prev => ({ ...prev, [chat._id]: 0 }));
  };

  const handleBack = () => setShowChatRoomMobile(false);

  const handleClearPendingRequests = useCallback(() => {
    setPendingRequests(0);
  }, []);

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
        style={{ height: "100vh", width: "100vw", overflow: "hidden", background: "#070a0f", fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* DESKTOP */}
        <div className="hidden lg:flex" style={{ height: "100vh", width: "100%" }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "30vw", flexShrink: 0, height: "100vh", borderRight: "1px solid rgba(255,255,255,0.06)" }}
          >
            <MessageList
              conversations={conversations}
              setActiveChat={handleSelectChat}
              activeChatId={activeChat?._id}
              unreadCounts={unreadCounts}
              pendingRequests={pendingRequests}
              onOpenFindFriends={handleClearPendingRequests}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ flex: 1, height: "100vh", overflow: "hidden", display: "flex", position: "relative" }}
          >
            <AnimatePresence>
              {chatLoading && (
                <LoadingScreen
                  variant="chat"
                  chatName={activeChat?.name}
                  chatAvatar={activeChat?.avatar}
                  onComplete={() => setChatLoading(false)}
                />
              )}
            </AnimatePresence>
            <ChatRoom
              activeChat={activeChat}
              conversations={conversations}
              setConversations={setConversations}
              loggedInUser={loggedInUserId ?? ""}
              myAvatar={myAvatar}
            />
          </motion.div>
        </div>

        {/* MOBILE */}
        <div className="block lg:hidden" style={{ height: "100vh", width: "100%", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <MessageList
              conversations={conversations}
              setActiveChat={handleSelectChat}
              activeChatId={activeChat?._id}
              unreadCounts={unreadCounts}
              pendingRequests={pendingRequests}
              onOpenFindFriends={handleClearPendingRequests}
            />
          </div>

          <AnimatePresence>
            {showChatRoomMobile && (
              <motion.div
                key="mobile-chatroom"
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.9 }}
                style={{ position: "absolute", inset: 0, zIndex: 100, background: "#070a0f", willChange: "transform" }}
              >
                <AnimatePresence>
                  {chatLoading && (
                    <LoadingScreen
                      variant="chat"
                      chatName={activeChat?.name}
                      chatAvatar={activeChat?.avatar}
                      onComplete={() => setChatLoading(false)}
                    />
                  )}
                </AnimatePresence>
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