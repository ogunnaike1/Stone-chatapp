import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../api/axios";

interface SettingsFormProps {
  onCloseSettings: () => void;
  onShowLogout: () => void;
}

const tabs = [
  "Profile",
  "General",
  "Privacy",
  "Notifications",
  "Appearance",
  "Security",
  "Advanced",
];

const DEFAULT_PROFILE_PIC =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

const SettingsForm = ({ onCloseSettings, onShowLogout }: SettingsFormProps) => {
  const [activeTab, setActiveTab] = useState("Profile");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [hideOnline, setHideOnline] = useState(false);
  const [emailNotif, setEmailNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(false);
  const [theme, setTheme] = useState("Light");
  const [password, setPassword] = useState("");
  const [betaFeatures, setBetaFeatures] = useState(false);

  useEffect(() => {
    // Load profile picture from localStorage if available
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.profilePicture) {
      setProfilePic(user.profilePicture);
    }
  }, []);


  const handleRemoveProfilePic = () => {
    setProfilePic(null);
  
    // update localStorage as well
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user) {
      user.profilePicture = null;
      localStorage.setItem("user", JSON.stringify(user));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setProfilePic(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        toast.error("User not logged in");
        return;
      }
  
      // Only proceed if a new profile picture was selected
      if (!profilePic || profilePic.startsWith("http")) {
        toast.error("No new profile picture to update.");
        return;
      }
  
      const { data } = await api.post("/user/upload-profile-pic", {
        userId: user.id,
        image: profilePic,
      });
  
  
      if (!data.status) {
        throw new Error(data.message);
      }
  
      // Update local storage with new profile picture
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Profile picture updated successfully!");
      setProfilePic(data.user.profilePicture); // update state to reflect saved image
    } catch (error: any) {
      console.error("Error updating profile picture:", error);
      toast.error(error.message || "Failed to update profile picture.");
    }
  };
  


  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.95, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 30 }}
  
        >
          {/* HEADER */}
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-blue-500">Settings</h2>
            <button
              onClick={onCloseSettings}
              className="text-gray-400 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          {/* BODY */}
          <div className="flex flex-1 overflow-hidden">
            {/* SIDEBAR */}
            <aside className="hidden md:flex flex-col w-64 border-r bg-gray-50 p-4">
              <div className="flex-1 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition
                      ${
                        activeTab === tab
                          ? "bg-blue-500 text-white"
                          : "text-gray-600 hover:bg-blue-100"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                onClick={onShowLogout}
                className="mt-4 px-4 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 font-medium"
              >
                Log Out
              </button>
            </aside>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              {/* MOBILE TABS */}
              <div className="md:hidden flex gap-2 overflow-x-auto mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap
                      ${
                        activeTab === tab
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
                <button
                  onClick={onShowLogout}
                  className="px-4 py-2 rounded-full bg-red-100 text-red-600 text-sm font-medium"
                >
                  Log Out
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* PROFILE */}
                  {activeTab === "Profile" && (
                  <section className="bg-white rounded-2xl p-6 border shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-5">
                    Profile Picture
                  </h3>
                
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Profile Avatar */}
                    <div className="relative w-32 h-32">
                      <img
                        src={profilePic || DEFAULT_PROFILE_PIC}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover border ring-2 ring-blue-300"
                      />
                
                      {/* Pencil Edit Icon */}
                      <label
                        className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 cursor-pointer hover:bg-blue-600"
                      >
                        <Edit2 className="text-white w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                
                    {/* Info & actions */}
                    <div className="text-center sm:text-left space-y-2">
                      <p className="text-gray-700 font-medium">Change your profile photo</p>
                      <p className="text-sm text-gray-400">JPG, PNG or WEBP · Max 5MB</p>
                      <div className="flex gap-3 justify-center sm:justify-start">
                        {profilePic && (
                          <div className="flex gap-3 justify-center sm:justify-start">
                          <button
                            onClick={handleRemoveProfilePic}
                            className="px-4 py-2 border border-red-300 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                          >
                            Remove
                          </button>
                        </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
                  )}

                  {/* GENERAL */}
                  {activeTab === "General" && (
                    <section className="bg-white rounded-2xl p-6 border shadow-sm space-y-4">
                      <h3 className="text-lg font-semibold">General Settings</h3>
                      <input
                        className="w-full input"
                        placeholder="Full Name"
                      />
                      <input
                        className="w-full input"
                        placeholder="Email Address"
                      />
                    </section>
                  )}

                  {/* PRIVACY */}
                  {activeTab === "Privacy" && (
                    <section className="bg-white rounded-2xl p-6 border shadow-sm space-y-4">
                      <h3 className="text-lg font-semibold">Privacy</h3>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" />
                        Make profile private
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" />
                        Hide online status
                      </label>
                    </section>
                  )}

                  {/* NOTIFICATIONS */}
                  {activeTab === "Notifications" && (
                    <section className="bg-white rounded-2xl p-6 border shadow-sm space-y-4">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      <label className="flex gap-3">
                        <input type="checkbox" /> Email notifications
                      </label>
                      <label className="flex gap-3">
                        <input type="checkbox" /> Push notifications
                      </label>
                    </section>
                  )}

                  {/* APPEARANCE */}
                  {activeTab === "Appearance" && (
                    <section className="bg-white rounded-2xl p-6 border shadow-sm space-y-4">
                      <h3 className="text-lg font-semibold">Appearance</h3>
                      <select className="input max-w-xs">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>System</option>
                      </select>
                    </section>
                  )}

                  {/* SECURITY */}
                  {activeTab === "Security" && (
                    <section className="bg-white rounded-2xl p-6 border shadow-sm space-y-4">
                      <h3 className="text-lg font-semibold">Security</h3>
                      <input
                        type="password"
                        placeholder="New Password"
                        className="input max-w-md"
                      />
                    </section>
                  )}

                  {/* ADVANCED */}
                  {activeTab === "Advanced" && (
                    <section className="bg-white rounded-2xl p-6 border shadow-sm space-y-4">
                      <h3 className="text-lg font-semibold">Advanced</h3>
                      <label className="flex gap-3">
                        <input type="checkbox" /> Enable beta features
                      </label>
                    </section>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t px-6 py-4 flex justify-end">
            <button onClick={handleSaveChanges} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
              Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsForm;
