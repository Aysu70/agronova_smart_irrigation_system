export const DEMO_USERS = [
  {
    _id: "demo-user-1",
    name: "Admin User",
    email: "admin@agranova.com",
    role: "admin",
    region: "baku",
    crops: ["Tomatoes", "Wheat"],
    createdAt: "2026-01-03T10:00:00.000Z",
  },
  {
    _id: "demo-user-2",
    name: "Rashad Mammadov",
    email: "rashad@farmer.com",
    role: "user",
    region: "ganja",
    crops: ["Cotton", "Barley"],
    createdAt: "2026-01-05T09:30:00.000Z",
  },
  {
    _id: "demo-user-3",
    name: "Leyla Hasanova",
    email: "leyla@farm.az",
    role: "user",
    region: "sheki",
    crops: ["Grapes", "Apples"],
    createdAt: "2026-01-07T08:15:00.000Z",
  },
  {
    _id: "demo-user-4",
    name: "Kamran Aliyev",
    email: "kamran@agro.az",
    role: "user",
    region: "lankaran",
    crops: ["Tea", "Rice"],
    createdAt: "2026-01-10T11:45:00.000Z",
  },
  {
    _id: "demo-user-5",
    name: "Aysel Quliyeva",
    email: "aysel@agro.az",
    role: "user",
    region: "quba",
    crops: ["Hazelnut", "Potato"],
    createdAt: "2026-01-14T14:05:00.000Z",
  },
  {
    _id: "demo-user-6",
    name: "Tural Ismayilov",
    email: "tural@farmer.az",
    role: "user",
    region: "shamakhi",
    crops: ["Grapes", "Wheat"],
    createdAt: "2026-01-18T13:25:00.000Z",
  },
];

export const DEMO_ORDERS = [
  {
    _id: "demo-order-1",
    orderId: "ORD-20260307-0001",
    userName: "Rashad Mammadov",
    userEmail: "rashad@farmer.com",
    deviceName: "AGRANOVA Smart Controller Pro",
    quantity: 1,
    totalAmount: 1299,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "card",
    shippingAddress: {
      region: "ganja",
      city: "Ganja",
      address: "123 Farm Street",
    },
    createdAt: "2026-02-08T09:30:00.000Z",
  },
  {
    _id: "demo-order-2",
    orderId: "ORD-20260307-0002",
    userName: "Leyla Hasanova",
    userEmail: "leyla@farm.az",
    deviceName: "AGRANOVA Sensor Kit Advanced",
    quantity: 2,
    totalAmount: 898,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "bank-transfer",
    shippingAddress: {
      region: "sheki",
      city: "Sheki",
      address: "456 Vineyard Road",
    },
    createdAt: "2026-02-20T12:10:00.000Z",
  },
  {
    _id: "demo-order-3",
    orderId: "ORD-20260307-0003",
    userName: "Kamran Aliyev",
    userEmail: "kamran@agro.az",
    deviceName: "Solar Water Pump System",
    quantity: 1,
    totalAmount: 899,
    status: "pending",
    paymentStatus: "unpaid",
    paymentMethod: "cash-on-delivery",
    shippingAddress: {
      region: "lankaran",
      city: "Lankaran",
      address: "789 Tea Plantation Lane",
    },
    createdAt: "2026-02-24T15:45:00.000Z",
  },
  {
    _id: "demo-order-4",
    orderId: "ORD-20260307-0004",
    userName: "Aysel Quliyeva",
    userEmail: "aysel@agro.az",
    deviceName: "Precision Drip Controller X2",
    quantity: 1,
    totalAmount: 649,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "card",
    shippingAddress: {
      region: "quba",
      city: "Quba",
      address: "14 Apple Valley",
    },
    createdAt: "2026-03-01T10:20:00.000Z",
  },
  {
    _id: "demo-order-5",
    orderId: "ORD-20260307-0005",
    userName: "Tural Ismayilov",
    userEmail: "tural@farmer.az",
    deviceName: "Basic Irrigation Controller",
    quantity: 3,
    totalAmount: 897,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "bank-transfer",
    shippingAddress: {
      region: "shamakhi",
      city: "Shamakhi",
      address: "77 Vineyard Cross",
    },
    createdAt: "2026-03-03T17:05:00.000Z",
  },
];

export const DEMO_SENSOR = {
  soilMoisture: 58,
  temperature: 24,
  humidity: 62,
  waterTankLevel: 72,
  pumpStatus: "OFF",
  timestamp: new Date().toISOString(),
  batteryLevel: 84,
  solarPanelStatus: "ACTIVE",
  solarPanelAngle: 35,
};

export const DEMO_ADVICES = [
  {
    id: "advice-1",
    title: "Irrigation scheduling for tomatoes",
    category: "farming-advice",
    message:
      "Water deeply every 3–4 days during establishment; increase frequency to every 1–2 days during fruiting depending on soil moisture. Mulch to conserve moisture and reduce evaporation.",
    author: "Agro Advisory",
    createdAt: "2026-02-10T08:00:00.000Z",
  },
  {
    id: "advice-2",
    title: "Soil testing and fertilizer planning",
    category: "recommendations",
    message:
      "Take a soil test before major fertilizer applications. Base NPK rates on soil test results; apply organic matter to improve structure and water holding capacity.",
    author: "Soil Lab",
    createdAt: "2026-02-12T09:15:00.000Z",
  },
  {
    id: "advice-3",
    title: "Protecting seedlings from late frost",
    category: "recommendations",
    message:
      "Cover seedlings with floating row cover overnight when frost is expected. Move sensitive transplants indoors or use cloches for small plots.",
    author: "Weather Advisory",
    createdAt: "2026-02-18T06:45:00.000Z",
  },
];

// Build a simple time-series for the last N days for analytics charts
export const buildDemoAnalytics = (days = 30) => {
  const series = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Simulate daily averages with some noise and weekly pattern
    const baseMoisture = 50 + 10 * Math.sin((2 * Math.PI * d.getDate()) / 30);
    const moisture = Math.round(baseMoisture + (Math.random() - 0.5) * 8);
    const temperature = Math.round(
      18 +
        6 * Math.sin((2 * Math.PI * d.getMonth()) / 12) +
        (Math.random() - 0.5) * 4,
    );
    const humidity = Math.min(
      100,
      Math.max(20, Math.round(55 + (Math.random() - 0.5) * 12)),
    );
    const waterUsage = Math.round(
      20 + (100 - moisture) * 0.6 + Math.random() * 10,
    );

    series.push({
      date: d.toISOString().slice(0, 10),
      soilMoisture: moisture,
      temperature,
      humidity,
      waterUsage,
    });
  }
  return series;
};

export const buildDemoDevices = (users, regionCoordinates, regionLabel) => {
  return users.map((user, index) => {
    const fallbackRegion = [
      "baku",
      "ganja",
      "sheki",
      "lankaran",
      "quba",
      "shamakhi",
    ][index % 6];
    const region = user.region || fallbackRegion;
    const coordinates = regionCoordinates(region);

    return {
      deviceId: `DEV-${1000 + index}`,
      deviceName: `AgroSmart-${index + 1}`,
      ownerId: user._id,
      ownerName: user.name,
      ownerEmail: user.email,
      region,
      location: {
        lat: coordinates[0] + (Math.random() - 0.5) * 0.4,
        lng: coordinates[1] + (Math.random() - 0.5) * 0.4,
        address: `${regionLabel(region)}, Azerbaijan`,
      },
      status: ["Active", "Active", "Offline", "Maintenance"][index % 4],
      signalStrength: 55 + ((index * 9) % 40),
      lastActive: new Date(Date.now() - index * 60 * 60 * 1000),
      firmware: `v${1 + (index % 3)}.${(index + 2) % 10}.0`,
      model: ["AgroSmart Pro", "AgroSmart Basic", "AgroSmart Plus"][index % 3],
      sensors: {
        moisture: true,
        temperature: true,
        humidity: true,
        light: index % 2 === 0,
      },
    };
  });
};

// Static demo devices (with coordinates) to power map views and device lists
export const DEMO_DEVICES = [
  {
    deviceId: "DEV-1001",
    deviceName: "AgroSmart-1",
    ownerId: "demo-user-2",
    ownerName: "Rashad Mammadov",
    ownerEmail: "rashad@farmer.com",
    region: "ganja",
    location: { lat: 40.6828, lng: 46.3606, address: "Ganja, Azerbaijan" },
    status: "Active",
    signalStrength: 78,
    lastActive: new Date().toISOString(),
    firmware: "v1.2.0",
    model: "AgroSmart Pro",
    sensors: { moisture: true, temperature: true, humidity: true },
  },
  {
    deviceId: "DEV-1002",
    deviceName: "AgroSmart-2",
    ownerId: "demo-user-3",
    ownerName: "Leyla Hasanova",
    ownerEmail: "leyla@farm.az",
    region: "sheki",
    location: { lat: 41.1911, lng: 47.1701, address: "Sheki, Azerbaijan" },
    status: "Active",
    signalStrength: 82,
    lastActive: new Date().toISOString(),
    firmware: "v1.0.3",
    model: "AgroSmart Basic",
    sensors: { moisture: true, temperature: true, humidity: false },
  },
  {
    deviceId: "DEV-1003",
    deviceName: "PumpController-1",
    ownerId: "demo-user-4",
    ownerName: "Kamran Aliyev",
    ownerEmail: "kamran@agro.az",
    region: "lankaran",
    location: { lat: 38.7588, lng: 48.8516, address: "Lankaran, Azerbaijan" },
    status: "Maintenance",
    signalStrength: 45,
    lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    firmware: "v2.0.0",
    model: "Solar Water Pump System",
    sensors: { moisture: false, temperature: true, humidity: true },
  },
  {
    deviceId: "DEV-1004",
    deviceName: "DripController-1",
    ownerId: "demo-user-5",
    ownerName: "Aysel Quliyeva",
    ownerEmail: "aysel@agro.az",
    region: "quba",
    location: { lat: 41.3703, lng: 48.5138, address: "Quba, Azerbaijan" },
    status: "Offline",
    signalStrength: 12,
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    firmware: "v1.1.1",
    model: "Precision Drip Controller X2",
    sensors: { moisture: true, temperature: true, humidity: true },
  },
  {
    deviceId: "DEV-1005",
    deviceName: "BasicIrrig-1",
    ownerId: "demo-user-6",
    ownerName: "Tural Ismayilov",
    ownerEmail: "tural@farmer.az",
    region: "shamakhi",
    location: { lat: 40.6061, lng: 48.6333, address: "Shamakhi, Azerbaijan" },
    status: "Active",
    signalStrength: 66,
    lastActive: new Date().toISOString(),
    firmware: "v1.0.0",
    model: "Basic Irrigation Controller",
    sensors: { moisture: true, temperature: false, humidity: false },
  },
];

export const DEMO_PAYMENTS = DEMO_ORDERS.map((o, idx) => ({
  id: `pay-${idx + 1}`,
  orderId: o.orderId,
  userName: o.userName,
  userEmail: o.userEmail,
  amount: o.totalAmount,
  method: o.paymentMethod || "card",
  status:
    o.paymentStatus === "paid"
      ? "Completed"
      : o.paymentStatus === "refunded"
        ? "Refunded"
        : "Pending",
  createdAt: o.createdAt,
}));
