import { Navigate } from "react-router-dom";
import type { JSX } from "react";

const getAdminTokenExpiry = (token: string): number | null => {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
};

const isAdminValid = (): boolean => {
  const token = localStorage.getItem("adminToken");
  if (!token) return false;
  const exp = getAdminTokenExpiry(token);
  if (!exp) return false;
  if (Date.now() >= exp * 1000) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    return false;
  }
  return true;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAdminValid()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default AdminRoute;