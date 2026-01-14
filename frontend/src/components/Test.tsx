import React, { useEffect, useState } from "react";
import { socket } from "../utils/socket";

const Test = () => {
    const [messages, setMessage] = useState("")
    const [display, setDisplay] = useState("")
  useEffect(() => {
    // confirm socket connection
    socket.on("connect", () => {
      console.log("✅ Client connected:", socket.id);
    });

    // listen for messages from server
    socket.on("receive_message", (data) => {

    });

    // cleanup to avoid duplicate listeners
    return () => {
      socket.off("connect");
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    
    socket.on("receive_message", (data)=>{
        setDisplay(data.message)
    })
  }, [socket])
  

  const sendMessage = () => {
    socket.emit("send_message", {
      message: messages
    });
    setMessage("")

    console.log("📤 Message sent");
  };

  return (
    <div className="flex items-center flex-col" style={{ padding: "20px" }}>
      <h2>Socket Test</h2>

      <input onChange={(e)=>setMessage(e.target.value)} value={messages} type="text" className="border-blue-400 border-2 " />

      <button
        onClick={sendMessage}
        style={{
          padding: "10px 16px",
          cursor: "pointer",
          fontSize: "16px"
        }}
        className="bg-blue-500 border-amber-200"
      >
        Send Message
      </button>

      <div>{display}</div>
    </div>
  );
};

export default Test;
