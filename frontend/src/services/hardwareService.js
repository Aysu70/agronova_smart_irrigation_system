import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5001/api";

class HardwareService {
  // Register a new device
  async registerDevice(deviceData) {
    const response = await axios.post(
      `${API_URL}/hardware/register`,
      deviceData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  }

  // Get user's devices
  async getDevices() {
    const response = await axios.get(`${API_URL}/hardware/devices`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  }

  // Get specific device
  async getDevice(deviceId) {
    const response = await axios.get(
      `${API_URL}/hardware/devices/${deviceId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  }

  // Get sensor history
  async getSensorHistory(deviceId, hours = 24, limit = 100) {
    const response = await axios.get(
      `${API_URL}/hardware/devices/${deviceId}/history`,
      {
        params: { hours, limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  }

  // Get latest reading
  async getLatestReading(deviceId) {
    const response = await axios.get(
      `${API_URL}/hardware/devices/${deviceId}/latest`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  }

  // Disconnect device
  async disconnectDevice(deviceId) {
    const response = await axios.put(
      `${API_URL}/hardware/devices/${deviceId}/disconnect`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  }

  // Delete device
  async deleteDevice(deviceId) {
    const response = await axios.delete(
      `${API_URL}/hardware/devices/${deviceId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  }

  // Control pump
  async controlPump(deviceId, command) {
    const response = await axios.post(
      `${API_URL}/hardware/devices/${deviceId}/pump`,
      { command },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  }
}

const hardwareService = new HardwareService();
export default hardwareService;
