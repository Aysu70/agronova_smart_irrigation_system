// Minimal mock data to enable fast, offline navigation during development
export const mockUser = {
  _id: "u1",
  name: "Demo User",
  email: "demo@local",
  role: "user",
};

export const mockDevices = [
  { _id: "d1", name: "Mock Controller", model: "MOCK-1", price: 199 },
  { _id: "d2", name: "Mock Sensor", model: "MOCK-S", price: 49 },
];

export const mockOrders = [
  {
    orderId: "ORD-FAKE-001",
    userName: "Demo User",
    deviceName: "Mock Controller",
    status: "delivered",
  },
];

export const mockGroups = [
  { _id: "g1", name: "Mock Group", description: "Fast nav group" },
];

export const mockDiscussions = [
  { _id: "dsc1", title: "Mock discussion", content: "This is mock content" },
];

export const mockSensorLatest = {
  soilMoisture: 55,
  temperature: 22,
  humidity: 60,
};

export const mockStats = { systemsOnline: 6, alerts: 2, users: 8 };

const mockData = {
  mockUser,
  mockDevices,
  mockOrders,
  mockGroups,
  mockDiscussions,
  mockSensorLatest,
  mockStats,
};

export default mockData;
