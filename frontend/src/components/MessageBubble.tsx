import React from "react";

interface Message {
  sender: "me" | "other";
  text: string;
  time: string;
}

interface MessageBubbleProps {
  msg: Message;
  myAvatar: string;
  otherAvatar: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, otherAvatar, myAvatar }) => {
  const isMe = msg.sender === "me";

  return (
    <div className={`flex items-end mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {/* Avatar on the left if not me */}
      {!isMe && (
        <img
          src={otherAvatar}
          alt="sender avatar"
          className="h-8 w-8 rounded-full flex-shrink-0"
        />
      )}

      {/* Message bubble */}
      <div
        className={`
          max-w-xs px-4 py-2 rounded-lg break-words
          ${isMe 
            ? "bg-blue-500 text-white rounded-br-none ml-2" 
            : "bg-white text-gray-800 rounded-bl-none mr-2"}
          shadow-sm
        `}
      >
        <p className="whitespace-pre-wrap">{msg.text}</p>
        <div className="text-[10px] text-gray-400 mt-1 text-right">{msg.time}</div>
      </div>

      {/* Avatar on the right if me */}
      {isMe && (
        <img
          src={myAvatar}
          alt="my avatar"
          className="h-8 w-8 rounded-full flex-shrink-0"
        />
      )}
    </div>
  );
};

export default MessageBubble;
