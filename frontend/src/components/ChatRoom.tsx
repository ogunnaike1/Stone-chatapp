import React, { useState } from 'react'
import { RxHamburgerMenu } from "react-icons/rx";
import { FaChevronRight } from "react-icons/fa6";
import ChatInput from "./ChatInput";
import Sidebar from './Sidebar';



const ChatRoom = () => {
    const [showSideBar, setShowSideBar] = useState(false)
  return (
<div className="w-[70vw] hidden lg:block">
  {/* HEADER */}
  <div className="h-[16vh] bg-blue-500 flex items-center justify-between px-6 text-white">
    <span className="text-2xl cursor-pointer" onClick={()=>setShowSideBar(true)}>
      <RxHamburgerMenu />
    </span>

    <div className="flex items-center gap-3">
      <img
        src="https://randomuser.me/api/portraits/men/32.jpg"
        className="h-10 w-10 rounded-full"
        alt="User"
      />
      <span>User Name</span>
      <FaChevronRight />
    </div>
  </div>

  {/* CHAT BODY */}
  <div className="bg-[#EDF0F9] h-[72vh] flex flex-col justify-between">
    {/* MESSAGES */}
    <div className="flex-1 px-10 py-6 overflow-y-auto space-y-4">
      {/* Other user */}
      <div className="flex items-end justify-start">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          className="h-8 w-8 rounded-full"
          alt="avatar"
        />
        <div className="max-w-xs px-4 py-2 bg-white text-gray-800 rounded-lg rounded-bl-none mr-2">
          Hello, how are you?
          <div className="text-[10px] text-gray-400 mt-1 text-right">
            12:30 PM
          </div>
        </div>
      </div>

      {/* Me */}
      <div className="flex items-end justify-end">
        <div className="max-w-xs px-4 py-2 bg-blue-500 text-white rounded-lg rounded-br-none ml-2">
          I’m good, thanks!
          <div className="text-[10px] text-gray-200 mt-1 text-right">
            12:31 PM
          </div>
        </div>
        <img
          src="https://randomuser.me/api/portraits/men/75.jpg"
          className="h-8 w-8 rounded-full"
          alt="my avatar"
        />
      </div>
    </div>

    {/* INPUT */}
    <ChatInput />
  </div>

  {/* SIDEBAR & LOGOUT MODAL */}
  {showSideBar && (  <Sidebar onClose={()=>setShowSideBar(false) }/>
  )}
 
</div>


  )
}

export default ChatRoom