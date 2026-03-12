import React from "react";
import { motion } from "framer-motion";
import { FaComments } from "react-icons/fa";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-blue-600 to-purple-700 text-white overflow-hidden">

      {/* NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex justify-between items-center px-10 py-6"
      >
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaComments /> StoneChat
        </h1>

        <div className="flex gap-8 items-center">
          <button className="hover:text-gray-300">Features</button>
          <button className="hover:text-gray-300">About</button>
          <button className="bg-white text-blue-700 px-5 py-2 rounded-full font-semibold hover:bg-gray-200 transition">
            Login
          </button>
        </div>
      </motion.nav>

      {/* HERO */}
      <div className="flex flex-col lg:flex-row items-center justify-center px-10 pt-10">

        {/* TEXT */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          className="max-w-xl"
        >
          <h1 className="text-5xl font-extrabold leading-tight">
            Chat Without Limits  
            <span className="text-yellow-300 block">
              Fast. Secure. Instant.
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-200">
            Experience real-time messaging with powerful features, smooth UI,
            and lightning fast delivery.
          </p>

          <div className="flex gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="bg-yellow-300 text-blue-800 px-7 py-3 rounded-full font-semibold shadow-lg"
            >
              Get Started
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              className="border border-white px-7 py-3 rounded-full"
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>

        {/* PHONE UI */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1 }}
          className="mt-16 lg:mt-0 lg:ml-16"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="bg-white rounded-3xl shadow-2xl w-72 h-[520px] p-4 text-black"
          >
            <div className="bg-blue-600 h-12 rounded-xl mb-4"></div>

            {/* Messages */}
            <div className="space-y-3">

              <motion.div
                animate={{ x: [20, 0] }}
                transition={{ delay: 1 }}
                className="bg-gray-200 p-2 rounded-xl w-4/5"
              >
                Hey! Are you coming?
              </motion.div>

              <motion.div
                animate={{ x: [-20, 0] }}
                transition={{ delay: 1.5 }}
                className="bg-blue-500 text-white p-2 rounded-xl w-3/5 ml-auto"
              >
                Yes I'm on my way 🚀
              </motion.div>

              <motion.div
                animate={{ x: [20, 0] }}
                transition={{ delay: 2 }}
                className="bg-gray-200 p-2 rounded-xl w-2/3"
              >
                Awesome 🔥
              </motion.div>

            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* FEATURES */}
      <div className="grid md:grid-cols-3 gap-10 px-12 mt-24 pb-20">

        <motion.div whileHover={{ scale: 1.05 }} className="bg-white/10 p-6 rounded-xl backdrop-blur">
          <h3 className="text-xl font-bold mb-2">⚡ Instant Messaging</h3>
          <p>Send messages in real-time with ultra fast delivery.</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="bg-white/10 p-6 rounded-xl backdrop-blur">
          <h3 className="text-xl font-bold mb-2">🔒 Secure</h3>
          <p>End-to-end encryption ensures your chats stay private.</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="bg-white/10 p-6 rounded-xl backdrop-blur">
          <h3 className="text-xl font-bold mb-2">🌎 Global</h3>
          <p>Connect with people anywhere in the world instantly.</p>
        </motion.div>

      </div>

    </div>
  );
};

export default LandingPage;