import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  MdPeople, MdMessage, MdBarChart, MdWarning, MdBlock,
  MdChat, MdDashboard, MdLogout, MdAdminPanelSettings,
  MdSearch, MdDelete, MdVisibility, MdPersonOff,
  MdRefresh, MdFilterList,
} from "react-icons/md";
import { FiUsers, FiMessageSquare, FiTrendingUp, FiClock } from "react-icons/fi";
import axios from "axios";

// ── API helper ────────────────────────────────────────────────────────────────
const adminApi = axios.create({ baseURL: "http://localhost:5002" });
adminApi.interceptors.request.use(cfg => {
  const token = localStorage.getItem("adminToken");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
adminApi.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.replace("/admin/login");
  }
  return Promise.reject(err);
});

// ── Types ─────────────────────────────────────────────────────────────────────
type Stats = {
  totalUsers: number; activeUsers: number; totalMessages: number;
  messagesToday: number; totalConversations: number; bannedUsers: number; reportedUsers: number;
};
type ChartPoint = { date?: string; hour?: number; count: number };
type User = {
  _id: string; username: string; email: string; profilePicture?: string;
  status: string; online: boolean; joinedAt: string; reportCount: number; friendCount: number;
};
type Message = {
  _id: string; text: string; createdAt: string;
  senderId: { username: string; profilePicture?: string };
  receiverId: { username: string };
  attachments?: { type: string; url: string; name: string }[];
};

type Tab = "dashboard" | "users" | "messages";

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent, sub }: any) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-1px", lineHeight: 1 }}>{value?.toLocaleString() ?? "—"}</div>
        {sub && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 6 }}>{sub}</div>}
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${accent}18`, border: `1px solid ${accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: accent }}>
        {icon}
      </div>
    </div>
  </motion.div>
);

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    active:    { bg: "rgba(0,245,160,0.1)",  color: "#00f5a0", label: "Active"     },
    suspended: { bg: "rgba(245,196,0,0.1)",  color: "#f5c400", label: "Suspended"  },
    banned:    { bg: "rgba(239,68,68,0.1)",   color: "#ef4444", label: "Banned"     },
  };
  const c = cfg[status] ?? cfg.active;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: c.bg, color: c.color, border: `1px solid ${c.color}30` }}>
      {c.label}
    </span>
  );
};

// ── Custom tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(7,10,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 14px", fontSize: 13 }}>
      <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#fff", fontWeight: 700 }}>{payload[0].value?.toLocaleString()}</div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const [tab, setTab]               = useState<Tab>("dashboard");
  const [stats, setStats]           = useState<Stats | null>(null);
  const [msgChart, setMsgChart]     = useState<ChartPoint[]>([]);
  const [userChart, setUserChart]   = useState<ChartPoint[]>([]);
  const [hoursChart, setHoursChart] = useState<ChartPoint[]>([]);

  const [users, setUsers]           = useState<User[]>([]);
  const [userTotal, setUserTotal]   = useState(0);
  const [userPage, setUserPage]     = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userStatus, setUserStatus] = useState("");

  const [messages, setMessages]         = useState<Message[]>([]);
  const [msgTotal, setMsgTotal]         = useState(0);
  const [msgPage, setMsgPage]           = useState(1);
  const [msgSearch, setMsgSearch]       = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Fetch functions ─────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const [s, mc, uc, hc] = await Promise.all([
      adminApi.get("/admin/stats"),
      adminApi.get("/admin/charts/messages"),
      adminApi.get("/admin/charts/users"),
      adminApi.get("/admin/charts/hours"),
    ]);
    setStats(s.data);
    setMsgChart(mc.data);
    setUserChart(uc.data);
    setHoursChart(hc.data);
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await adminApi.get("/admin/users", {
      params: { page: userPage, search: userSearch, status: userStatus, limit: 15 },
    });
    setUsers(res.data.users);
    setUserTotal(res.data.total);
  }, [userPage, userSearch, userStatus]);

  const fetchMessages = useCallback(async () => {
    const res = await adminApi.get("/admin/messages", {
      params: { page: msgPage, search: msgSearch, limit: 20 },
    });
    setMessages(res.data.messages);
    setMsgTotal(res.data.total);
  }, [msgPage, msgSearch]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (tab === "users")    fetchUsers();    }, [tab, fetchUsers]);
  useEffect(() => { if (tab === "messages") fetchMessages(); }, [tab, fetchMessages]);

  // ── User actions ────────────────────────────────────────────────────────────
  const setUserStatusAction = async (userId: string, status: string) => {
    setActionLoading(userId);
    await adminApi.patch(`/admin/users/${userId}/status`, { status });
    await fetchUsers();
    setActionLoading(null);
  };

  const deleteUserAction = async (userId: string) => {
    if (!confirm("Permanently delete this user and all their messages?")) return;
    setActionLoading(userId);
    await adminApi.delete(`/admin/users/${userId}`);
    await fetchUsers();
    await fetchStats();
    setActionLoading(null);
  };

  const deleteMessageAction = async (msgId: string) => {
    setActionLoading(msgId);
    await adminApi.delete(`/admin/messages/${msgId}`);
    await fetchMessages();
    setActionLoading(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login", { replace: true });
  };

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: <MdDashboard /> },
    { id: "users",     label: "Users",     icon: <MdPeople /> },
    { id: "messages",  label: "Messages",  icon: <MdMessage /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060810", color: "#fff", fontFamily: "'DM Sans', sans-serif", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 4px; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        table { border-collapse: collapse; width: 100%; }
        th, td { text-align: left; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ width: 220, flexShrink: 0, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: "24px 0" }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#3b82f6" }}>
              <MdAdminPanelSettings />
            </div>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, color: "#fff" }}>StoneChat</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>Admin</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "0 10px" }}>
          {NAV.map(n => {
            const active = tab === n.id;
            return (
              <motion.button key={n.id} onClick={() => setTab(n.id as Tab)}
                whileHover={!active ? { background: "rgba(255,255,255,0.04)" } : {}}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: active ? "rgba(59,130,246,0.12)" : "transparent", color: active ? "#60a5fa" : "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginBottom: 2, borderLeft: active ? "2px solid #3b82f6" : "2px solid transparent" }}>
                <span style={{ fontSize: 18 }}>{n.icon}</span> {n.label}
              </motion.button>
            );
          })}
        </div>

        {/* Admin info + logout */}
        <div style={{ padding: "16px 14px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{adminUser.username}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>{adminUser.role}</div>
          <motion.button onClick={handleLogout} whileHover={{ color: "#ef4444" }}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <MdLogout /> Sign out
          </motion.button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>

        {/* ════ DASHBOARD TAB ════ */}
        {tab === "dashboard" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: "-0.8px" }}>Dashboard</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 3 }}>Overview of StoneChat activity</div>
              </div>
              <motion.button onClick={fetchStats} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                <MdRefresh /> Refresh
              </motion.button>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
              <StatCard icon={<FiUsers />}       label="Total Users"     value={stats?.totalUsers}       accent="#3b82f6" />
              <StatCard icon={<MdPeople />}      label="Online Now"      value={stats?.activeUsers}      accent="#00f5a0" sub="active sockets" />
              <StatCard icon={<FiMessageSquare />} label="Total Messages" value={stats?.totalMessages}   accent="#8b5cf6" />
              <StatCard icon={<FiTrendingUp />}  label="Sent Today"      value={stats?.messagesToday}    accent="#06b6d4" />
              <StatCard icon={<MdChat />}        label="Conversations"   value={stats?.totalConversations} accent="#f59e0b" />
              <StatCard icon={<MdBlock />}       label="Banned Users"    value={stats?.bannedUsers}      accent="#ef4444" />
              <StatCard icon={<MdWarning />}     label="Reported Users"  value={stats?.reportedUsers}    accent="#f97316" />
            </div>

            {/* Charts row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {/* Messages per day */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "22px 20px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 18, color: "rgba(255,255,255,0.8)" }}>Messages per day</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={msgChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={v => v?.slice(5)} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* New users per day */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "22px 20px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 18, color: "rgba(255,255,255,0.8)" }}>New users per day</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={userChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={v => v?.slice(5)} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" fill="#00f5a0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Peak hours */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "22px 20px" }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 18, color: "rgba(255,255,255,0.8)" }}>Peak chat hours (last 7 days)</div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={hoursChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={h => `${h}:00`} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* ════ USERS TAB ════ */}
        {tab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: "-0.6px" }}>Users</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 2 }}>{userTotal.toLocaleString()} total</div>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <MdSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 18 }} />
                <input value={userSearch} onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                  placeholder="Search by username…"
                  style={{ width: "100%", padding: "10px 14px 10px 38px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
              </div>
              <select value={userStatus} onChange={e => { setUserStatus(e.target.value); setUserPage(1); }}
                style={{ padding: "10px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", cursor: "pointer" }}>
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            {/* Table */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["User", "Email", "Status", "Friends", "Reports", "Joined", "Actions"].map(h => (
                        <th key={h} style={{ padding: "13px 16px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 0.8, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <motion.tr key={u._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ position: "relative" }}>
                              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#60a5fa", flexShrink: 0, overflow: "hidden" }}>
                                {u.profilePicture ? <img src={u.profilePicture} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : u.username[0].toUpperCase()}
                              </div>
                              {u.online && <div style={{ position: "absolute", bottom: 1, right: 1, width: 8, height: 8, borderRadius: "50%", background: "#00f5a0", border: "1.5px solid #060810" }} />}
                            </div>
                            <div>
                              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{u.username}</div>
                              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>{u._id.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "13px 16px", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{u.email}</td>
                        <td style={{ padding: "13px 16px" }}><StatusBadge status={u.status} /></td>
                        <td style={{ padding: "13px 16px", color: "rgba(255,255,255,0.6)", fontSize: 13, textAlign: "center" }}>{u.friendCount}</td>
                        <td style={{ padding: "13px 16px", textAlign: "center" }}>
                          <span style={{ color: u.reportCount > 0 ? "#f97316" : "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: u.reportCount > 0 ? 700 : 400 }}>{u.reportCount}</span>
                        </td>
                        <td style={{ padding: "13px 16px", color: "rgba(255,255,255,0.4)", fontSize: 12, whiteSpace: "nowrap" }}>
                          {new Date(u.joinedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {u.status !== "suspended" && (
                              <ActionBtn label="Suspend" color="#f5c400" icon={<MdPersonOff size={13} />} loading={actionLoading === u._id}
                                onClick={() => setUserStatusAction(u._id, "suspended")} />
                            )}
                            {u.status !== "banned" && (
                              <ActionBtn label="Ban" color="#ef4444" icon={<MdBlock size={13} />} loading={actionLoading === u._id}
                                onClick={() => setUserStatusAction(u._id, "banned")} />
                            )}
                            {u.status !== "active" && (
                              <ActionBtn label="Restore" color="#00f5a0" icon={<MdVisibility size={13} />} loading={actionLoading === u._id}
                                onClick={() => setUserStatusAction(u._id, "active")} />
                            )}
                            <ActionBtn label="Delete" color="#6b7280" icon={<MdDelete size={13} />} loading={actionLoading === u._id}
                              onClick={() => deleteUserAction(u._id)} />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                  Showing {Math.min((userPage - 1) * 15 + 1, userTotal)}–{Math.min(userPage * 15, userTotal)} of {userTotal}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  {[...Array(Math.ceil(userTotal / 15)).keys()].slice(0, 6).map(p => (
                    <button key={p} onClick={() => setUserPage(p + 1)}
                      style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid", borderColor: userPage === p + 1 ? "#3b82f6" : "rgba(255,255,255,0.1)", background: userPage === p + 1 ? "rgba(59,130,246,0.15)" : "transparent", color: userPage === p + 1 ? "#60a5fa" : "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}>
                      {p + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ MESSAGES TAB ════ */}
        {tab === "messages" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: "-0.6px" }}>Messages</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 2 }}>{msgTotal.toLocaleString()} total messages</div>
              </div>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 20, maxWidth: 400 }}>
              <MdSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 18 }} />
              <input value={msgSearch} onChange={e => { setMsgSearch(e.target.value); setMsgPage(1); }}
                placeholder="Search message content…"
                style={{ width: "100%", padding: "10px 14px 10px 38px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
            </div>

            {/* Message list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div key={m._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.025 }}
                    style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 }}>
                    {/* Avatar */}
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#60a5fa", flexShrink: 0, overflow: "hidden" }}>
                      {m.senderId?.profilePicture ? <img src={m.senderId.profilePicture} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (m.senderId?.username?.[0] ?? "?")}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{m.senderId?.username ?? "Unknown"}</span>
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>→</span>
                        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{m.receiverId?.username ?? "Unknown"}</span>
                        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginLeft: "auto" }}>
                          {new Date(m.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {m.text && <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.55, wordBreak: "break-word" }}>{m.text}</p>}
                      {m.attachments && m.attachments.length > 0 && (
                        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                          {m.attachments.map((a, ai) => (
                            <a key={ai} href={a.url} target="_blank" rel="noreferrer"
                              style={{ fontSize: 11, color: "#60a5fa", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 6, padding: "3px 9px", textDecoration: "none" }}>
                              📎 {a.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <motion.button whileHover={{ color: "#ef4444", scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => deleteMessageAction(m._id)}
                      style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 17, display: "flex", flexShrink: 0 }}>
                      <MdDelete />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {[...Array(Math.min(Math.ceil(msgTotal / 20), 8)).keys()].map(p => (
                <button key={p} onClick={() => setMsgPage(p + 1)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid", borderColor: msgPage === p + 1 ? "#3b82f6" : "rgba(255,255,255,0.1)", background: msgPage === p + 1 ? "rgba(59,130,246,0.15)" : "transparent", color: msgPage === p + 1 ? "#60a5fa" : "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer" }}>
                  {p + 1}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ── Small action button ───────────────────────────────────────────────────────
const ActionBtn = ({ label, color, icon, onClick, loading }: any) => (
  <motion.button onClick={onClick} disabled={loading}
    whileHover={!loading ? { scale: 1.06 } : {}} whileTap={!loading ? { scale: 0.94 } : {}}
    style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 7, border: `1px solid ${color}30`, background: `${color}10`, color, fontSize: 11, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.5 : 1, whiteSpace: "nowrap" }}>
    {icon} {label}
  </motion.button>
);

export default AdminDashboard;