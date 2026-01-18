import React, { useEffect, useState } from "react";
import { socket } from "../utils/socket";

const Test = () => {
    const [message, setMessage] = useState("")
    const [display, setDisplay] = useState("")
    const [roomNumber, setRoomNumber] = useState<number | null>(null);
  useEffect(() => {
    // confirm socket connection
    socket.on("connect", () => {
      console.log("✅ Client connected:", socket.id);
    });

    // listen for messages from server
    socket.on("receive_message", (data) => {
      console.log("📩 Message from server:", data);
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
      message,
      roomNumber
    });
    setMessage("")

    console.log("📤 Message sent");
  };

  const joinRoom = ()=>{
    if (roomNumber === null) return;
    socket.emit("join_room", roomNumber);
    

  }

  return (
    <div className="flex items-center flex-col" style={{ padding: "20px" }}>
      <h2>Socket Test</h2>

      <input type="text" placeholder="join room" onChange={(e)=>setRoomNumber(e.target.value)} />
      <button onClick={joinRoom}>join</button>

      <input onChange={(e)=>setMessage(e.target.value)} value={message} type="text" className="border-blue-400 border-2 " />

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
