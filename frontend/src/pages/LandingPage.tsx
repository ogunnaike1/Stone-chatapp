import React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { FaComments, FaBolt, FaLock, FaUserFriends } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

const features = [
  {
    icon: FaBolt,
    title: "Instant messaging",
    text: "Send and receive messages in real time with smooth, responsive chat.",
  },
  {
    icon: FaLock,
    title: "Private & secure",
    text: "Protected conversations with a clean, trustworthy experience.",
  },
  {
    icon: FaUserFriends,
    title: "Built for connection",
    text: "Find friends, start conversations, and stay connected everywhere.",
  },
];

const phoneMessages = [
  { side: "left", text: "Hey, are you online?", time: "09:41" },
  { side: "right", text: "Yep — testing the new StoneChat landing page 👀", time: "09:42" },
  { side: "left", text: "This 3D effect looks amazing.", time: "09:42" },
  { side: "right", text: "Wait till you see the live app.", time: "09:43" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: "easeOut" },
  }),
};

function Glow({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.35, 0.55, 0.35],
        x: [0, 20, 0],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

function Phone3D() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 18 });

  const rotateX = useTransform(smoothY, [-180, 180], [12, -12]);
  const rotateY = useTransform(smoothX, [-180, 180], [-16, 16]);

  const glowX = useTransform(smoothX, [-180, 180], ["35%", "65%"]);
  const glowY = useTransform(smoothY, [-180, 180], ["30%", "70%"]);

  const glare = useMotionTemplate`radial-gradient(circle at ${glowX} ${glowY}, rgba(255,255,255,0.18), transparent 35%)`;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="relative mx-auto w-full max-w-[460px]" style={{ perspective: 1400 }}>
      <motion.div
        className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-400/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative mx-auto h-[580px] w-[320px] cursor-pointer"
      >
        <div
          className="absolute inset-0 rounded-[42px] bg-cyan-500/10 blur-3xl"
          style={{ transform: "translateZ(-80px) scale(1.05)" }}
        />

        <div
          className="absolute inset-0 rounded-[42px] border border-white/10 bg-white/5 backdrop-blur-xl"
          style={{ transform: "translateZ(-50px)" }}
        />

        <div
          className="absolute inset-0 rounded-[42px] border border-white/15 bg-[#0B1220] p-3 shadow-2xl"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="relative h-full overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-[#0f172a]">
            <motion.div className="absolute inset-0 opacity-70" style={{ background: glare }} />

            <div className="absolute left-1/2 top-3 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-black/70" />

            <div
              className="absolute inset-x-4 top-6 z-20"
              style={{ transform: "translateZ(80px)" }}
            >
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600">
                    <FaComments className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">StoneChat</p>
                    <p className="text-xs text-emerald-300">12 friends online</p>
                  </div>
                </div>

                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
              </div>
            </div>

            <div
              className="absolute inset-x-4 top-24 z-20 space-y-3"
              style={{ transform: "translateZ(100px)" }}
            >
              {phoneMessages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.18, duration: 0.5 }}
                  className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-lg ${
                    msg.side === "right"
                      ? "ml-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      : "bg-white/10 text-slate-100 backdrop-blur-md"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="mt-1 block text-[10px] opacity-70">{msg.time}</span>
                </motion.div>
              ))}
            </div>

            <div
              className="absolute inset-x-4 bottom-4 z-20"
              style={{ transform: "translateZ(110px)" }}
            >
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md">
                <input
                  readOnly
                  value="Type a message..."
                  className="w-full bg-transparent text-sm text-slate-300 outline-none"
                />
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg">
                  <IoSend />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute -left-16 top-24"
          style={{ transform: "translateZ(120px)" }}
        >
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [-3, 2, -3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 backdrop-blur-md shadow-xl"
          >
            <p className="text-xs text-cyan-200">Encrypted chat</p>
            <p className="text-sm font-semibold text-white">Private by design</p>
          </motion.div>
        </div>

        <div
          className="absolute -right-14 top-72"
          style={{ transform: "translateZ(130px)" }}
        >
          <motion.div
            animate={{ y: [0, 12, 0], rotate: [3, -2, 3] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-3 backdrop-blur-md shadow-xl"
          >
            <p className="text-xs text-fuchsia-200">Live status</p>
            <p className="text-sm font-semibold text-white">Friends online now</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <Glow className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl" />
      <Glow
        className="absolute right-0 top-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl"
        delay={1}
      />
      <Glow
        className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl"
        delay={2}
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px] opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

      <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg">
            <FaComments className="text-lg text-white" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-wide">STONECHAT</p>
            <p className="text-xs text-slate-400">Modern chat experience</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden items-center gap-4 md:flex"
        >
          <a href="#features" className="text-sm text-slate-300 hover:text-white">
            Features
          </a>
          <a
            href="/auth/login"
            className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm backdrop-blur-md hover:bg-white/15"
          >
            Login
          </a>
          <a
            href="/auth/register"
            className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2 text-sm font-medium text-white shadow-lg hover:scale-[1.02]"
          >
            Get Started
          </a>
        </motion.div>
      </nav>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-90px)] max-w-7xl items-center gap-14 px-6 pb-20 pt-6 lg:grid-cols-2 lg:px-8">
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.1}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200 backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            3D animated chat landing page
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.2}
            className="max-w-xl text-5xl font-black leading-tight sm:text-6xl"
          >
            Chat in a space that feels
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent">
              {" "}
              alive
            </span>
            .
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.35}
            className="mt-6 max-w-xl text-lg leading-8 text-slate-300"
          >
            StoneChat helps people connect instantly with private messaging,
            real-time conversations, and a beautiful interface that feels modern,
            immersive, and fast.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.5}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <a
              href="/auth/register"
              className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-7 py-4 text-center font-semibold text-white shadow-[0_18px_45px_rgba(34,211,238,0.28)] transition hover:scale-[1.02]"
            >
              Start chatting
            </a>
            <a
              href="/auth/login"
              className="rounded-full border border-white/15 bg-white/10 px-7 py-4 text-center font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
            >
              Login
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.65}
            className="mt-10 grid max-w-xl grid-cols-3 gap-4"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="text-2xl font-bold text-white">10x</p>
              <p className="text-sm text-slate-400">Smoother feel</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-sm text-slate-400">Real-time messaging</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-sm text-slate-400">Modern UI vibe</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative"
        >
          <Phone3D />
        </motion.div>
      </main>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <motion.h2
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold sm:text-4xl"
          >
            Built for modern conversations
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-3 text-slate-400"
          >
            A landing page that feels dynamic, premium, and ready for a real chat product.
          </motion.p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.12 }}
                whileHover={{
                  y: -10,
                  rotateX: 6,
                  rotateY: index % 2 === 0 ? -6 : 6,
                  scale: 1.02,
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xl text-white shadow-lg"
                  style={{ transform: "translateZ(40px)" }}
                >
                  <Icon />
                </div>

                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{feature.text}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
