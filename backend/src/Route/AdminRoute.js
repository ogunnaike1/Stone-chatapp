// ── verifyAdmin.js  (server/middleware/verifyAdmin.js) ────────────────────────
// Drop this file next to your existing authMiddleware.js

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Not authorized" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin)
      return res.status(403).json({ message: "Admin access only" });
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyAdmin;


// ── adminRouter.js  (server/Routes/adminRouter.js) ────────────────────────────
// Add this to your main app.js:  app.use("/admin", adminRouter);

const express    = require("express");
const adminRouter = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  seedAdmin,
  adminLogin,
  getDashboardStats,
  getMessagesPerDay,
  getNewUsersPerDay,
  getPeakHours,
  getUsers,
  updateUserStatus,
  deleteUser,
  getMessages,
  deleteMessage,
} = require("../Controller/AdminController");

// Public
adminRouter.post("/login", adminLogin);
adminRouter.post("/seed",  seedAdmin); // remove or guard this in production

// Protected — all routes below require a valid admin JWT
adminRouter.get("/stats",            verifyAdmin, getDashboardStats);
adminRouter.get("/charts/messages",  verifyAdmin, getMessagesPerDay);
adminRouter.get("/charts/users",     verifyAdmin, getNewUsersPerDay);
adminRouter.get("/charts/hours",     verifyAdmin, getPeakHours);
adminRouter.get("/users",            verifyAdmin, getUsers);
adminRouter.patch("/users/:userId/status", verifyAdmin, updateUserStatus);
adminRouter.delete("/users/:userId",       verifyAdmin, deleteUser);
adminRouter.get("/messages",               verifyAdmin, getMessages);
adminRouter.delete("/messages/:messageId", verifyAdmin, deleteMessage);

module.exports = adminRouter;