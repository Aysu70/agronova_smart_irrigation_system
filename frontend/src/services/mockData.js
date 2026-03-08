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

// More detailed, context-aware mock AI response generator. Prefer this when available.
export function getMockAIResponseDetailed(question, conversationHistory = []) {
  const q = (question || "").toLowerCase();

  // reuse basic keyword detection
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
        "I’m sorry — I can only answer agriculture-related questions. Please ask about crops, soil, irrigation, pests, fertilizers or similar topics.",
      isRestricted: true,
    };
  }

  // Build a richer reply using simple templates and conversation history cues
  const lastAssistant =
    (conversationHistory || [])
      .slice()
      .reverse()
      .find((m) => m.role === "assistant")?.content || "";

  if (q.includes("irrigation") || q.includes("water")) {
    return {
      message: `Irrigation plan (detailed):\n\n• Monitor: Install soil moisture sensors at root zone depths. Aim for a target range rather than a single reading (e.g. maintain 50–75% of field capacity for many crops).\n\n• Schedule: Use sensor thresholds to trigger irrigation. Example: if moisture <50% → irrigate until ~70%. Adjust thresholds by crop and soil type.\n\n• Volume & Frequency: Light, frequent watering suits seedlings; established crops need deeper, less frequent events. If you tell me crop type and area (ha or m²), I can estimate volumes and run times for common emitters.\n\n• Efficiency: Prefer drip for water-limited areas; check uniformity (Cochran or emitter tests).\n\nWould you like a sample daily/weekly schedule for a specific crop and field size?`,
      isRestricted: false,
    };
  }

  if (
    q.includes("soil") ||
    q.includes("fertilizer") ||
    q.includes("nutrient")
  ) {
    return {
      message: `Soil and fertility (detailed):\n\n• Test: A current soil test (pH, organic matter, available P/K and nitrate-N) is essential — results drive recommendations.\n\n• pH: Most crops prefer ~6.0–7.0. If pH is outside this range, small corrective applications (lime or sulfur) can be applied over time.\n\n• Organic matter: Add compost, green manure or cover crops to improve structure and water-holding capacity.\n\n• Fertilizer strategy: Use starter fertilizer at planting for young plants, then side-dress nitrogen during rapid growth. Exact rates depend on soil tests and crop; if you share test numbers I can suggest realistic ranges and timing.\n\nTell me your crop and any recent soil test numbers (pH, N-P-K) and I’ll give step-by-step guidance.`,
      isRestricted: false,
    };
  }

  if (q.includes("pest") || q.includes("insect") || q.includes("disease")) {
    return {
      message: `Pest & disease guidance (detailed):\n\n• Identify: Correct identification (species, life stage, symptoms) is the first step — photos help.\n\n• Monitoring & thresholds: Use scouting and traps; act only when economic thresholds are exceeded.\n\n• Non-chemical options: Rotate crops, use resistant varieties, encourage predators, apply biocontrols.\n\n• Chemical options: When needed, choose the most targeted product, follow label rates, and observe pre-harvest intervals.\n\nIf you describe symptoms or upload a photo, I can offer a prioritized list of next steps.`,
      isRestricted: false,
    };
  }

  if (q.includes("crop") || q.includes("plant") || q.includes("grow")) {
    return {
      message: `Crop management (detailed):\n\n• Variety selection: Choose varieties suited to your climate and disease pressure.\n\n• Planting: Use recommended planting density and depth; poor emergence often comes from incorrect depth or seedbed issues.\n\n• Nutrition & water: Sync fertilizer timings with growth stages; supply more water during flowering/fruiting.\n\n• Harvest & storage: Harvest at recommended maturity and handle carefully to avoid post-harvest losses.\n\nShare your crop and region for tailored planting dates and spacing recommendations.`,
      isRestricted: false,
    };
  }

  if (q.includes("weather") || q.includes("climate") || q.includes("season")) {
    return {
      message: `Weather & climate (detailed):\n\n• Use local frost dates and historical climate data when planning.\n\n• Track forecasts before key operations (planting, spraying, harvest).\n\n• Combine forecast and soil moisture data to avoid unnecessary irrigation.\n\nIf you give me your location I can suggest immediate precautions based on typical seasonal risks.`,
      isRestricted: false,
    };
  }

  // default
  return {
    message: `Thanks — I can provide more targeted advice if you share crop type, field size, soil test data, location or the specific issue you observe.`,
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
  getMockAIResponseDetailed,
};

export default mockData;
