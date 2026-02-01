import React from "react";

export type Message = {
  text: string;
  sender: "me" | "other";
  time: string;
};

type MessageBubbleProps = {
  msg: Message;
  otherAvatar: string;
  myAvatar: string;
};

const MessageBubble = ({ msg, otherAvatar, myAvatar }: MessageBubbleProps) => {
  const isMe = msg.sender === "me";

  return (
    <div className={`flex items-end mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <img
          src={otherAvatar}
          className="h-8 w-8 rounded-full flex-shrink-0"
        />
      )}

      <div
        className={`max-w-xs px-4 py-2 rounded-lg break-words ${
          isMe
            ? "bg-blue-500 text-white rounded-br-none ml-2"
            : "bg-white text-gray-800 rounded-bl-none mr-2"
        }`}
      >
        <div>{msg.text}</div>
        <div className="text-[10px] text-gray-400 mt-1 text-right">
          {msg.time}
        </div>
      </div>

      {isMe && (
        <img src={myAvatar} className="h-8 w-8 rounded-full flex-shrink-0" />
      )}
    </div>
  );
};

export default MessageBubble;
