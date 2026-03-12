import { useEffect, useState, useCallback } from "react";
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
};

type FriendRequest = {
  fromId: string;
  fromName: string;
  fromAvatar: string | null;
};

// ── Sort conversations: most recent message first ──
const sortConversations = (convs: Conversation[]): Conversation[] =>
  [...convs].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return new Date(b.time).getTime() - new Date(a.time).getTime();
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

  // unreadCounts: { [conversationId]: number }
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // pendingRequests: number of unread friend requests
  const [pendingRequests, setPendingRequests] = useState(0);

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
    socket.emit("register_user", loggedInUserId);
  }, [loggedInUserId]);

  /* ── SOCKET: RECEIVE MESSAGE ── */
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

      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv._id !== msg.from && conv._id !== msg.to) return conv;
          if (conv.messages.some(m => m.id === msg.messageId)) return conv;
          return {
            ...conv,
            lastMessage: msg.text,
            time: incoming.time,
            messages: [...conv.messages, incoming],
          };
        });
        // ── Instant re-sort after new message ──
        return sortConversations(updated);
      });

      // Only show notification + increment badge if chat is NOT currently open
      setActiveChat(current => {
        const isOpenChat = current?._id === msg.from || current?._id === msg.to;

        if (!isOpenChat) {
          // Unread badge
          const senderId = msg.from === loggedInUserId ? msg.to : msg.from;
          setUnreadCounts(prev => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1,
          }));

          // Toast notification — find sender name from conversations
          setConversations(convs => {
            const sender = convs.find(c => c._id === msg.from);
            if (sender) {
              notify({
                type: "info",
                title: sender.name,
                message: msg.text.length > 60 ? msg.text.slice(0, 60) + "…" : msg.text,
              });
            }
            return convs; // no change, just reading
          });
        }

        return current; // don't change activeChat
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => { socket.off("receive_message", handleReceiveMessage); };
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

      // Add them to conversations list instantly without a reload
      const newConv: Conversation = {
        _id: data.byId,
        name: data.byName,
        avatar: data.byAvatar || FALLBACK_AVATAR,
        lastMessage: "",
        time: "",
        messages: [],
      };

      setConversations(prev => {
        if (prev.some(c => c._id === data.byId)) return prev; // already there
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
    // Clear unread badge for this conversation
    setUnreadCounts(prev => ({ ...prev, [chat._id]: 0 }));
  };

  const handleBack = () => setShowChatRoomMobile(false);

  /* ── CLEAR PENDING REQUESTS (called when FindFriends modal opens) ── */
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
        style={{
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          background: "#070a0f",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >

        {/* ══════════════════════════════════════════
            DESKTOP (lg+)
        ══════════════════════════════════════════ */}
        <div className="hidden lg:flex" style={{ height: "100vh", width: "100%" }}>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

        {/* ══════════════════════════════════════════
            MOBILE (< lg)
        ══════════════════════════════════════════ */}
        <div
          className="block lg:hidden"
          style={{ height: "100vh", width: "100%", position: "relative", overflow: "hidden" }}
        >
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
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
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