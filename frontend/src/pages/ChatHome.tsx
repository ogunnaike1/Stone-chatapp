import { useEffect, useState } from "react";
import MessageList from "../components/MessageList";
import ChatRoom from "../components/ChatRoom";
import type { User } from "../components/MessageList";
import { initSocket } from "../utils/socket";

const ChatHome = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    initSocket(); // <-- ensures socket is connected and user joins room
  }, []);

  return (
    <div className="flex h-screen">
      <ChatRoom selectedUser={selectedUser} />
      <MessageList onSelectUser={(user) => setSelectedUser(user)} />
    </div>
  );
};

export default ChatHome;
