import { motion, AnimatePresence } from "framer-motion";
import { IoMdSearch, IoMdClose } from "react-icons/io";
import { useEffect, useState } from "react";
import api from "../api/axios";

type UserResult = {
  _id: string;
  username: string;
  profilePicture?: string;
};

type FindFriendsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FALLBACK_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const FindFriendsModal = ({ isOpen, onClose }: FindFriendsModalProps) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<UserResult[]>([]);
  const [allUsers, setAllUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH INITIAL DATA ================= */
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      const token = localStorage.getItem("token");

      // 1️⃣ Friends
      const friendsRes = await api.get("/user/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFriends(friendsRes.data.map((u: any) => u._id));

      // 2️⃣ Friend Requests
      const requestRes = await api.get("/user/friends/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFriendRequests(requestRes.data);

      // 3️⃣ All Users
      try {
        const res = await api.get("/user/users", {
            headers: { Authorization: `Bearer ${token}` },
          });
         
          console.log(res)
          const sortedUsers = res.data
            .sort((a: any, b: any) =>
              a.username.localeCompare(b.username)
            );
    
          setAllUsers(sortedUsers);
          console.log(sortedUsers)
        
      } catch (error) {

        console.log(error)

        
      }
    
    };

    fetchData();
  }, [isOpen]);

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
  
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
  
        const res = await api.get(
          `/user/friends/search?query=${search}`,
          tokenHeader
        );
  
        setResults(res.data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 400);
  
    return () => clearTimeout(timeout);
  }, [search]);
  

  /* ================= ACTIONS ================= */

  const tokenHeader = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  const handleSendRequest = async (id: string) => {
    await api.post(
      "/user/friends/request",
      { receiverId: id },
      tokenHeader
    );
  };

  const handleAccept = async (id: string) => {
    await api.post(
      "/user/friends/accept",
      { senderId: id },
      tokenHeader
    );

    setFriendRequests((prev) =>
      prev.filter((u) => u._id !== id)
    );

    setFriends((prev) => [...prev, id]);
  };

  const handleReject = async (id: string) => {
    await api.post(
      "/user/friends/reject",
      { senderId: id },
      tokenHeader
    );

    setFriendRequests((prev) =>
      prev.filter((u) => u._id !== id)
    );
  };

  /* ================= RENDER ================= */

  const displayedUsers = search ? results : allUsers;


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl max-h-[85vh] overflow-y-auto"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Find Friends
                </h2>
                <button onClick={onClose}>
                  <IoMdClose className="text-xl text-gray-500" />
                </button>
              </div>

              {/* SEARCH */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <IoMdSearch className="text-gray-400 text-lg" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by username..."
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>

              {/* ================= FRIEND REQUESTS ================= */}
              {friendRequests.length > 0 && (
                <>
                  <h3 className="mt-6 mb-2 text-sm font-semibold text-gray-500">
                    Friend Requests
                  </h3>

                  {friendRequests.map((user) => (
                    <div
                      key={user._id}
                      className="flex justify-between items-center py-2"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.profilePicture ||
                            FALLBACK_AVATAR
                          }
                          className="h-10 w-10 rounded-full"
                        />
                        <span>{user.username}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleAccept(user._id)
                          }
                          className="text-green-600 text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleReject(user._id)
                          }
                          className="text-red-600 text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* ================= ALL USERS ================= */}
              <h3 className="mt-6 mb-2 text-sm font-semibold text-gray-500">
                All Users (A–Z)
              </h3>

              {displayedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        user.profilePicture ||
                        FALLBACK_AVATAR
                      }
                      className="h-10 w-10 rounded-full"
                    />
                    <span>{user.username}</span>
                  </div>

                  {friends.includes(user._id) ? (
                    <span className="text-xs text-gray-400">
                      Friends
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        handleSendRequest(user._id)
                      }
                      className="text-sm text-blue-600"
                    >
                      Send Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FindFriendsModal;
