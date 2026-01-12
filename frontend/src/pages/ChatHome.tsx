import MessageList from "../components/MessageList";
import ChatRoom from "../components/ChatRoom";
import { useState } from "react";
import type { User } from "../components/MessageList";

const ChatHome = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
        <div className="flex h-screen">
        <ChatRoom selectedUser={selectedUser} />
        <MessageList onSelectUser={(user: User) => setSelectedUser(user)} />
        
      </div>
    );
  };
  
  export default ChatHome;
  