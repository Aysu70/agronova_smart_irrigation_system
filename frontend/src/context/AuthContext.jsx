import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const data = response?.data?.data;
      if (!data) {
        console.error("Unexpected login response:", response);
        throw new Error("Invalid server response");
      }

      const { token, ...userData } = data;

      // Safeguard: token must exist
      if (!token) {
        console.error("Login response missing token:", response);
        throw new Error("Authentication token missing from server response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      toast.success("Welcome back!");
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error.response || error.message || error);
      const message =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(message);
      return { success: false };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const respData = response?.data;
      if (!respData) {
        console.error("Unexpected register response:", response);
        throw new Error("Invalid server response");
      }

      if (respData.success && respData.data) {
        const { token, ...userData } = respData.data;

        if (!token) {
          console.error("Register response missing token:", response);
          throw new Error("Authentication token missing from server response");
        }

        // Store token and user data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update state
        setUser(userData);
        setIsAuthenticated(true);

        toast.success("Account created successfully!");
        return true;
      }

      // If server returned a failure message, surface it
      const serverMsg = respData.message || "Registration failed";
      toast.error(serverMsg);
      return false;
    } catch (error) {
      console.error(
        "Registration error:",
        error.response || error.message || error,
      );
      const message =
        error.response?.data?.message || error.message || "Registration failed";
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data.data);
      localStorage.setItem("user", JSON.stringify(response.data.data));
      toast.success("Profile updated!");
      return true;
    } catch (error) {
      toast.error("Failed to update profile");
      return false;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
