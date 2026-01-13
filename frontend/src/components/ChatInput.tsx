import React, { useState } from 'react'
import { IoSendSharp } from "react-icons/io5";

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    
    if (!text.trim()) return;
    onSend(text);
    setText(""); // clear input
  };


  return (
      <div className="w-full">
    <div className="flex w-[80%] py-[5px] shadow-lg mx-auto items-center rounded-[8px] px-[20px] bg-white space-x-2 border border-transparent focus-within:border-blue-500 transition-colors duration-200">
      <textarea
        placeholder="Type your message..."
        rows={1}
        className="w-full resize-none overflow-y-auto outline-0 py-2"
        style={{
          minHeight: "2rem", // about 1 line
          maxHeight: "4rem", // about 4 lines
        }}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
      />
      <button  onClick={handleSend} 
      className="text-blue-500 hover:bg-[#dbdada] text-[24px] px-2 py-2 rounded-full">
          <IoSendSharp />
      </button>
    </div>
  </div>

  )
}

export default ChatInput