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

export function getMockAIResponse(question) {
  const q = (question || "").toLowerCase();

  const agronomyKeywords = [
    "crop",
    "farm",
    "soil",
    "plant",
    "agriculture",
    "irrigation",
    "fertilizer",
    "pest",
    "harvest",
    "seed",
    "weather",
    "climate",
    "yield",
    "water",
    "moisture",
    "temperature",
    "humidity",
    "nutrient",
    "disease",
    "weed",
    "insect",
  ];

  const isAgronomy = agronomyKeywords.some((k) => q.includes(k));

  if (!isAgronomy) {
    return {
      message:
        "I apologize, but I can only answer questions related to agriculture, farming, and agronomy. Please ask me about crops, soil, irrigation, fertilizers, pest control, or other farming-related topics.",
      isRestricted: true,
    };
  }

  if (q.includes("irrigation") || q.includes("water")) {
    return {
      message:
        "For irrigation: monitor soil moisture, water early morning or late evening, prefer drip irrigation for efficiency, and adjust frequency by crop stage and weather.",
      isRestricted: false,
    };
  }

  if (
    q.includes("soil") ||
    q.includes("fertilizer") ||
    q.includes("nutrient")
  ) {
    return {
      message:
        "Soil tips: test pH, add organic matter, use NPK balanced fertilizers based on crop needs, and practice crop rotation.",
      isRestricted: false,
    };
  }

  if (q.includes("pest") || q.includes("insect") || q.includes("disease")) {
    return {
      message:
        "Pest management: monitor regularly, use resistant varieties, apply biological controls first, and use chemicals only when necessary.",
      isRestricted: false,
    };
  }

  if (q.includes("crop") || q.includes("plant") || q.includes("grow")) {
    return {
      message:
        "Crop advice: choose suitable varieties, prepare soil, follow spacing/depth recommendations, provide adequate water and nutrients.",
      isRestricted: false,
    };
  }

  if (q.includes("weather") || q.includes("climate") || q.includes("season")) {
    return {
      message:
        "Weather advice: plan planting around frost dates, monitor forecasts, and adjust irrigation based on rainfall.",
      isRestricted: false,
    };
  }

  // Default agronomy reply
  return {
    message:
      "Thanks for your agriculture question — could you share more details (crop type, location, or current problem) so I can provide targeted advice?",
    isRestricted: false,
  };
}

const mockData = {
  mockUser,
  mockDevices,
  mockOrders,
  mockGroups,
  mockDiscussions,
  mockSensorLatest,
  mockStats,
  getMockAIResponse,
};

export default mockData;
