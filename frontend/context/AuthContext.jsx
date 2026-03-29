"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "@/services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // check token on load
  useEffect(() => {
   const token = localStorage.getItem("token");

  if (!token) {
    setLoading(false);
    return;
  }

  // fetch full user
  getMe()
    .then((res) => {
      setUser(res.data);
    })
    .catch(() => {
      localStorage.removeItem("token");
      setUser(null);
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);

    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser(payload);
  };

  const logout = () => {
  localStorage.removeItem("token");
  setUser(null);

  // redirect after logout
  window.location.href = "/login";
};
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => useContext(AuthContext);