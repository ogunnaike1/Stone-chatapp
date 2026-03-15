import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5002",
});

// ── Attach token to every request ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Intercept 401 responses anywhere in the app ───────────────────────────────
// When the server rejects a request because the token is expired or invalid,
// clear localStorage and hard-redirect to login immediately.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // replace() so the user can't press Back and return to a protected page
      window.location.replace("/auth/login");
    }
    return Promise.reject(error);
  }
);

export default api;