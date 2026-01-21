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

const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  myAvatar,
  otherAvatar,
}) => {
  const isMe = msg.sender === "me";

  return (
    <div
      className={`flex items-end mb-2 ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      {/* RECEIVER (LEFT) */}
      {!isMe && (
        <img
          src={otherAvatar}
          alt="receiver avatar"
          className="h-8 w-8 rounded-full mr-2"
        />
      )}

      {/* MESSAGE BUBBLE */}
      <div
        className={`max-w-xs px-4 py-2 rounded-lg break-words shadow-sm
          ${
            isMe
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-white text-gray-800 rounded-bl-none"
          }
        `}
      >
        <p className="whitespace-pre-wrap">{msg.text}</p>
        <div className="text-[10px] text-gray-400 mt-1 text-right">
          {msg.time}
        </div>
      </div>

      {/* SENDER (RIGHT) */}
      {isMe && (
        <img
          src={myAvatar}
          alt="my avatar"
          className="h-8 w-8 rounded-full ml-2"
        />
      )}
    </div>
  );
};

export default MessageBubble;
