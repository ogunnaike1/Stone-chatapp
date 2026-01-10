import { useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import LogoutModal from "./LogoutModal";
import { useNavigate } from "react-router-dom";
import SettingsForm from "./SettingsForm";
import { logout } from "../utils/auth";
import { toast } from "react-toastify";


const MessageList = () => {
    const [showSettings, setShowSettings] = useState(false);
    const [showLogoutOption, setShowLogoutOption] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
      logout ();
      toast.success("logout successful")
      setTimeout(() => {
        navigate("/auth/login");
      }, 1000);
     
    };


  return (
    <div className="lg:w-[30vw] w-full border-r">
      {/* HEADER */}
      <div className="bg-blue-700 pb-4">
        <div className="text-white flex w-[90%] pt-3 mx-auto justify-between">
          <span className="text-xl font-bold">STONECHAT</span>

          <div className="flex gap-4 text-lg cursor-pointer">
            <FaPlus />
            <span onClick={()=>setShowSettings(true)}><BsThreeDotsVertical /></span>
            
          </div>
        </div>

        {/* SEARCH */}
        <div className="w-[90%] mx-auto mt-4 bg-white h-10 px-4 flex items-center rounded-2xl">
          <IoMdSearch />
          <input
            className="w-full ml-2 outline-none"
            placeholder="Search for a chat"
          />
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="bg-[#F3F4F6] h-[85vh] overflow-y-auto">
        {[1, 2, 3, 4, 5].map((_, i) => (
          <div
            key={i}
            className="flex justify-between items-center px-4 py-3 hover:bg-gray-200 cursor-pointer border-b"
          >
            <div className="flex gap-3 items-center">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                className="h-10 w-10 rounded-full"
                alt="user"
              />
              <div>
                <p className="font-semibold">Username</p>
                <p className="text-sm text-gray-500 truncate">
                  Last message preview goes here
                </p>
              </div>
            </div>

            <span className="text-xs text-blue-500">12:45</span>
          </div>
        ))}
      </div>
 

        {showSettings && (
         <SettingsForm onCloseSettings={() => setShowSettings(false)} onShowLogout ={() =>  setShowLogoutOption(true)} />

      )
      }

      {showLogoutOption && (
              <LogoutModal
              onConfirm={handleLogout}
              onCancel={() => setShowLogoutOption(false)}
            />

      )
      }
    </div>
  );
};

export default MessageList;
