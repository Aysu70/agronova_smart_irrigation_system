import axios from "axios";
import mock from "./mockData";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const FAST_NAV = process.env.REACT_APP_FAST_NAV === "true";

// If FAST_NAV is enabled, override api methods to return mock data quickly.
if (FAST_NAV) {
  const fastGet = (path) => {
    // quick matching for common endpoints used during navigation
    if (path.startsWith("/auth/me"))
      return Promise.resolve({ data: mock.mockUser });
    if (path.startsWith("/devices") || path === "/devices")
      return Promise.resolve({ data: mock.mockDevices });
    if (path.startsWith("/orders"))
      return Promise.resolve({ data: mock.mockOrders });
    if (path.startsWith("/community/groups"))
      return Promise.resolve({ data: mock.mockGroups });
    if (path.startsWith("/discussions") || path.startsWith("/posts"))
      return Promise.resolve({ data: mock.mockDiscussions });
    if (path.startsWith("/sensors/latest"))
      return Promise.resolve({ data: mock.mockSensorLatest });
    if (path.startsWith("/admin/systems/stats"))
      return Promise.resolve({ data: mock.mockStats });
    if (path.startsWith("/alerts")) return Promise.resolve({ data: [] });
    // Fallback: return empty object quickly
    return Promise.resolve({ data: {} });
  };

  api.get = (path) => fastGet(path);
  api.post = (path, body) => {
    if (path === "/auth/login" || path === "/auth/register") {
      const email =
        body?.email || (body?.data && body.data.email) || "demo@local";
      // If admin credentials provided, return admin user
      if (email === "admin@agranova.com") {
        return Promise.resolve({
          data: {
            data: {
              token: "demo-admin-token",
              _id: "admin_001",
              name: "Admin User",
              email: "admin@agranova.com",
              role: "admin",
            },
          },
        });
      }
      // default demo user
      return Promise.resolve({
        data: {
          data: {
            token: "demo-token",
            _id: "u1",
            name: "Demo User",
            email: email,
            role: "user",
          },
        },
      });
    }
    return Promise.resolve({ data: {} });
  };
  api.put = () => Promise.resolve({ data: {} });
  api.patch = () => Promise.resolve({ data: {} });
  api.delete = () => Promise.resolve({ data: {} });
}

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Sensor API
export const sensorAPI = {
  getLatest: () => api.get("/sensors/latest"),
  getHistory: (period = "24h") => api.get(`/sensors/history?period=${period}`),
  createData: (data) => api.post("/sensors", data),
};

// Irrigation API
export const irrigationAPI = {
  getConfig: () => api.get("/irrigation/config"),
  updateConfig: (data) => api.put("/irrigation/config", data),
  controlPump: (data) => api.post("/irrigation/pump", data),
  getStats: (period = "7d") => api.get(`/irrigation/stats?period=${period}`),
};

// Alert API
export const alertAPI = {
  getAll: () => api.get("/alerts"),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  markAllAsRead: () => api.put("/alerts/read/all"),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
};

// Community API
export const communityAPI = {
  // Groups
  getGroups: () => api.get("/community/groups"),
  createGroup: (data) => api.post("/community/groups", data),
  joinGroup: (groupId) => api.post(`/community/groups/${groupId}/join`),

  // Messages
  getMessages: (groupId, limit = 50) =>
    api.get(`/community/groups/${groupId}/messages?limit=${limit}`),
  sendMessage: (groupId, data) =>
    api.post(`/community/groups/${groupId}/messages`, data),

  // Questions
  getQuestions: () => api.get("/community/questions"),
  createQuestion: (data) => api.post("/community/questions", data),
  addAnswer: (questionId, data) =>
    api.post(`/community/questions/${questionId}/answers`, data),
  markBestAnswer: (questionId, answerId) =>
    api.put(`/community/questions/${questionId}/answers/${answerId}/best`),
};

// AI API
export const aiAPI = {
  chat: (data) => api.post("/ai/chat", data),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => api.get("/admin/users"),
  getOrders: () => api.get("/orders"),
  getUser: (id) => api.get(`/admin/users/${id}`),
  promoteToAdmin: (id) => api.patch(`/admin/users/${id}/promote`),
  demoteToUser: (id) => api.patch(`/admin/users/${id}/demote`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

// Admin System API
export const adminSystemAPI = {
  getDashboardStats: () => api.get("/admin/systems/stats"),
  getAllSystems: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/admin/systems/systems?${params}`);
  },
  getSystemById: (id) => api.get(`/admin/systems/system/${id}`),
  getSystemLogs: (systemId, limit = 50) =>
    api.get(`/admin/systems/logs/${systemId}?limit=${limit}`),
  getAlerts: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/admin/systems/alerts?${params}`);
  },
  markAlertRead: (id) => api.patch(`/admin/systems/alert/${id}/read`),
  resolveAlert: (id) => api.patch(`/admin/systems/alert/${id}/resolve`),
};

export default api;
