import React, { useState, type ChangeEvent, type RefObject } from "react";
import { IoSendSharp } from "react-icons/io5";

type ChatInputProps = {
  message: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  handleInput: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
};

const ChatInput: React.FC<ChatInputProps> = ({
  message,
  textareaRef,
  handleInput,
  onSend,
}) => {
  return (
    <div className="w-full  px-4 py-3">
      <div className="flex w-[80%] mx-auto items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-md border border-transparent focus-within:border-blue-500 transition-colors duration-200">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          placeholder="Type your message..."
          rows={1}
          className="w-full resize-none overflow-y-auto outline-none py-2"
          style={{
            minHeight: "2rem", // ~1 line
            maxHeight: "4rem", // ~4 lines
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <button
          onClick={onSend}
          className="text-blue-500 hover:bg-gray-200 p-2 rounded-full transition-colors"
        >
          <IoSendSharp size={24} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
