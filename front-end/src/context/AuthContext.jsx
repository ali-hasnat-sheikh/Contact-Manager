import { createContext, useContext, useEffect, useState } from "react";
import { api, setAccessToken, refreshSession } from "../api/client";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, try to restore a session via the refresh cookie.
  useEffect(() => {
    (async () => {
      try {
        const data = await refreshSession();
        setAccessToken(data.accessToken);
        // Prefer the user from refresh; fall back to /current if absent.
        setUser(data.user ?? (await api.current()));
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Apply the result of a successful auth call (login/register/google).
  const applyAuth = (data) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const login = async (credentials) => {
    const data = await api.login(credentials);
    applyAuth(data);
    return data;
  };

  const register = async (payload) => {
    const data = await api.register(payload);
    applyAuth(data);
    return data;
  };

  const loginWithGoogle = async (credential) => {
    const data = await api.googleLogin(credential);
    applyAuth(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore network errors on logout
    }
    setAccessToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
