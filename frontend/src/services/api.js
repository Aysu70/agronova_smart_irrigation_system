import axios from "axios";
import mock from "./mockData";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // default timeout (ms) to avoid long hangs when backend is unreachable
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || "5000", 10),
});

let useFastNav = process.env.REACT_APP_FAST_NAV === "true";

// fast handlers (same behavior as previous FAST_NAV override)
const fastGet = (path) => {
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
  return Promise.resolve({ data: {} });
};

const fastPost = (path, body) => {
  if (path === "/auth/login" || path === "/auth/register") {
    const email =
      body?.email || (body?.data && body.data.email) || "demo@local";
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

  if (path === "/ai/chat" || path.startsWith("/ai/chat")) {
    const q = body?.message || (body?.data && body.data.message) || "";
    const conv = body?.conversationHistory || [];
    const reply =
      typeof mock.getMockAIResponseDetailed === "function"
        ? mock.getMockAIResponseDetailed(q, conv)
        : typeof mock.getMockAIResponse === "function"
          ? mock.getMockAIResponse(q)
          : { message: "Hello!", isRestricted: false };
    return Promise.resolve({ data: { data: reply } });
  }
  return Promise.resolve({ data: {} });
};

// Probe backend quickly; if unreachable, enable fast-nav fallback automatically
async function probeBackend() {
  if (useFastNav) return;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    await fetch(API_URL + "/health", {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (e) {
    console.warn("Backend health check failed; enabling FAST_NAV fallback.", e);
    useFastNav = true;
  }
}

probeBackend();

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
    // If unauthorized, clear local session and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Network errors (no response) should be surfaced with a clear message
    if (!error.response) {
      // Create a friendlier error object
      const netErr = new Error(
        "Network Error: Unable to reach the API server.",
      );
      netErr.isNetworkError = true;
      return Promise.reject(netErr);
    }

    return Promise.reject(error);
  },
);

// --- Simple in-memory GET cache to speed repeated loads of heavy endpoints ---
const _cache = new Map();
const CACHE_TTL = parseInt(process.env.REACT_APP_API_CACHE_TTL || "60000", 10); // default 60s

// wrap current api.get (works with FAST_NAV override because we bind after FAST_NAV)
const _originalGet = api.get.bind(api);
api.get = (path, ...rest) => {
  if (useFastNav) return fastGet(path);
  try {
    const cacheable = [
      "/devices",
      "/sensors/latest",
      "/admin/systems/stats",
      "/auth/me",
      "/orders",
    ];
    if (cacheable.some((p) => path.startsWith(p))) {
      const key = path;
      const entry = _cache.get(key);
      if (entry && Date.now() - entry.ts < CACHE_TTL) {
        return Promise.resolve({ data: entry.value });
      }
      return _originalGet(path, ...rest).then((res) => {
        try {
          _cache.set(key, { value: res.data, ts: Date.now() });
        } catch (e) {}
        return res;
      });
    }
  } catch (e) {
    // If cache wrapper fails, fall back to original
    return _originalGet(path, ...rest);
  }
  return _originalGet(path, ...rest);
};

// wrap post so we can return fast responses when useFastNav is enabled
const _originalPost = api.post.bind(api);
api.post = (path, body, ...rest) => {
  if (useFastNav) return fastPost(path, body);
  return _originalPost(path, body, ...rest);
};

// clear cache when user logs out / gets 401 (already redirecting)
const _originalResponseReject = api.interceptors.response.handlers?.find?.(
  () => true,
);
// ensure cache is cleared on 401 redirect
api.interceptors.response.use(undefined, (err) => {
  if (err?.response?.status === 401) {
    _cache.clear();
  }
  return Promise.reject(err);
});

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
