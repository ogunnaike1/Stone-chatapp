import MessageList from "../components/MessageList";
import ChatRoom from "../components/ChatRoom";


const ChatHome = () => {
    return (
        <div className="flex h-screen">
        <ChatRoom/>
        <MessageList/>
      </div>
    );
  };
  
  export default ChatHome;
  