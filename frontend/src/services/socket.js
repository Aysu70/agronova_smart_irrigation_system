import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on("connect", () => {
        console.log("✅ WebSocket connected");
      });

      this.socket.on("disconnect", () => {
        console.log("❌ WebSocket disconnected");
      });

      this.socket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  joinGroup(groupId) {
    this.emit("join_group", groupId);
  }

  leaveGroup(groupId) {
    this.emit("leave_group", groupId);
  }

  joinUserRoom(userId) {
    this.emit("join", userId);
    console.log(`Joined user room: ${userId}`);
  }

  sendMessage(data) {
    this.emit("send_message", data);
  }
}

const socketService = new SocketService();
export default socketService;
