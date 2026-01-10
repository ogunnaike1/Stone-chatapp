import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoute;