import React from "react";
import { FaRegWindowClose } from "react-icons/fa";
import { RiShoppingBag4Fill } from "react-icons/ri";
import { BsChatDotsFill } from "react-icons/bs";
import { CiLogout } from "react-icons/ci";

type SidebarProps = {
  onClose: ()=> void// prop type
};

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  return (
    <div className="w-[80px] bg-white h-[100vh] absolute top-0 pt-[10px] shadow-lg">
      <div className="w-full flex flex-col items-center gap-[10px]">
        <div className="flex flex-col gap-[2px] items-center">
          <button
            onClick={onClose}
            className="text-[40px] text-[#9EA4BC] rounded-[10px] p-[8px] bg-gray-200"
          >
            <FaRegWindowClose />
          </button>
          <span className="text-[#9EA4BC] text-[14px]">Close</span>
        </div>

        <div className="flex flex-col gap-[2px] items-center">
          <button className="text-[40px] text-[#9EA4BC] rounded-[10px] p-[8px] bg-gray-200">
            <RiShoppingBag4Fill />
          </button>
          <span className="text-[#9EA4BC] text-[14px]">Shop</span>
        </div>

        <div className="flex flex-col gap-[2px] items-center">
          <button className="text-[40px] text-[#9EA4BC] rounded-[10px] p-[8px] bg-gray-200">
            <BsChatDotsFill />
          </button>
          <span className="text-[#9EA4BC] text-[14px]">Chat</span>
        </div>

        <div className="flex flex-col gap-[2px] items-center">
          <button className="text-[40px] text-[#9EA4BC] rounded-[10px] p-[8px] bg-gray-200">
          <CiLogout />
          </button>
          <span className="text-[#9EA4BC] text-[14px]">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
