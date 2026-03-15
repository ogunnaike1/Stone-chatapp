export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    if (Date.now() >= exp * 1000) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const logout = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};