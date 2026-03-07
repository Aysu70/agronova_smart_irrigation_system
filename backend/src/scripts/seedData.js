require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Device = require('../models/Device');
const Order = require('../models/Order');
const Discussion = require('../models/Discussion');
const IrrigationSystem = require('../models/IrrigationSystem');
const UserReputation = require('../models/UserReputation');
const FarmerGroup = require('../models/FarmerGroup');
const Group = require('../models/Group');
const Message = require('../models/Message');
const Question = require('../models/Question');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const AdminAlert = require('../models/AdminAlert');
const SystemLog = require('../models/SystemLog');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agranova';

const users = [
  { name: 'Admin User', email: 'admin@agranova.com', password: 'admin123', role: 'admin', region: 'Baku', crops: ['Tomatoes', 'Wheat'] },
  { name: 'Rashad Mammadov', email: 'rashad@farmer.com', password: 'user123', role: 'user', region: 'Ganja', crops: ['Cotton', 'Barley'] },
  { name: 'Leyla Hasanova', email: 'leyla@farm.az', password: 'user123', role: 'user', region: 'Sheki', crops: ['Grapes', 'Apples'] },
  { name: 'Kamran Aliyev', email: 'kamran@agro.az', password: 'user123', role: 'user', region: 'Lankaran', crops: ['Tea', 'Rice'] },
  { name: 'Aysel Quliyeva', email: 'aysel@agro.az', password: 'user123', role: 'user', region: 'Quba', crops: ['Hazelnut', 'Potato'] },
  { name: 'Tural Ismayilov', email: 'tural@farmer.az', password: 'user123', role: 'user', region: 'Shamakhi', crops: ['Grapes', 'Wheat'] },
  { name: 'Nigar Rahimova', email: 'nigar@farm.az', password: 'user123', role: 'user', region: 'Saatli', crops: ['Cotton', 'Corn'] },
  { name: 'Elvin Abbasov', email: 'elvin@smartfarm.az', password: 'user123', role: 'user', region: 'Gabala', crops: ['Apple', 'Plum'] }
];

const devices = [
  {
    name: 'AGRANOVA Smart Controller Pro',
    model: 'ASC-PRO-2026',
    description: 'Advanced irrigation controller with AI-powered water management, solar panel, and real-time monitoring.',
    features: ['AI-powered water optimization', 'Solar powered with battery backup', 'Real-time soil moisture monitoring', '4G/WiFi connectivity', 'Weather forecast integration', 'Mobile app control', 'Supports up to 8 zones'],
    specifications: {
      waterCapacity: 'Manages up to 5000L/day',
      coverage: 'Up to 5 hectares',
      solarPower: '100W solar panel included',
      connectivity: '4G LTE, WiFi, Bluetooth'
    },
    price: 1299,
    currency: 'USD',
    category: 'complete-system',
    inStock: true,
    stockQuantity: 25,
    rating: 4.8,
    reviewCount: 47
  },
  {
    name: 'AGRANOVA Sensor Kit Advanced',
    model: 'ASK-ADV-2026',
    description: 'Complete sensor kit for precision agriculture with soil moisture, temperature, and humidity sensors.',
    features: ['3x Soil moisture sensors', '2x Temperature sensors', '1x Humidity sensor', 'Wireless connectivity', '2-year battery life', 'Weather-resistant design'],
    specifications: {
      waterCapacity: 'N/A',
      coverage: 'Monitors up to 2 hectares',
      solarPower: 'Battery powered',
      connectivity: 'LoRa, WiFi'
    },
    price: 449,
    currency: 'USD',
    category: 'sensor-kit',
    inStock: true,
    stockQuantity: 50,
    rating: 4.6,
    reviewCount: 89
  },
  {
    name: 'Solar Water Pump System',
    model: 'SWP-500-2026',
    description: 'Efficient solar-powered water pump system for irrigation with automatic control.',
    features: ['500W solar pump', 'Automatic water level control', 'Built-in inverter', 'Low maintenance', 'Works in remote areas', '5-year warranty'],
    specifications: {
      waterCapacity: 'Pumps up to 3000L/hour',
      coverage: 'Irrigates up to 3 hectares',
      solarPower: '500W solar panel array',
      connectivity: 'Manual/Automatic control'
    },
    price: 899,
    currency: 'USD',
    category: 'pump-system',
    inStock: true,
    stockQuantity: 15,
    rating: 4.7,
    reviewCount: 34
  },
  {
    name: 'Basic Irrigation Controller',
    model: 'BIC-100-2026',
    description: 'Simple and affordable irrigation controller for small farms.',
    features: ['Easy to install', 'Timer-based control', 'Manual override', 'Weather-resistant', '4 zone control', '1-year warranty'],
    specifications: {
      waterCapacity: 'Manages up to 1000L/day',
      coverage: 'Up to 1 hectare',
      solarPower: 'AC powered',
      connectivity: 'Manual control only'
    },
    price: 299,
    currency: 'USD',
    category: 'irrigation-controller',
    inStock: true,
    stockQuantity: 40,
    rating: 4.3,
    reviewCount: 112
  },
  {
    name: 'AGRANOVA Field Gateway Mini',
    model: 'AFG-MINI-2026',
    description: 'Compact field gateway for connecting edge sensors to cloud dashboard.',
    features: ['Dual SIM fallback', 'Low-power mode', 'Remote firmware updates', 'Edge buffering'],
    specifications: {
      waterCapacity: 'N/A',
      coverage: 'Up to 1.5 kilometers',
      solarPower: 'Optional 40W panel',
      connectivity: '4G LTE, WiFi, LoRa'
    },
    price: 529,
    currency: 'USD',
    category: 'sensor-kit',
    inStock: true,
    stockQuantity: 18,
    rating: 4.5,
    reviewCount: 21
  },
  {
    name: 'Precision Drip Controller X2',
    model: 'PDC-X2-2026',
    description: 'Two-channel precision drip controller for vineyards and orchards.',
    features: ['2-channel zone control', 'Pressure anomaly alerts', 'Night mode irrigation', 'Leak detection support'],
    specifications: {
      waterCapacity: 'Manages up to 2200L/day',
      coverage: 'Up to 2.2 hectares',
      solarPower: '60W panel supported',
      connectivity: 'WiFi, Bluetooth'
    },
    price: 649,
    currency: 'USD',
    category: 'irrigation-controller',
    inStock: true,
    stockQuantity: 22,
    rating: 4.4,
    reviewCount: 16
  }
];

const irrigationSystems = [
  {
    systemId: 'SYS-2026-001',
    region: 'Baku',
    location: { latitude: 40.4093, longitude: 49.8671 },
    soilMoisture: 65,
    temperature: 24,
    humidity: 55,
    pumpStatus: 'ON',
    waterTankLevel: 75,
    batteryLevel: 82,
    solarStatus: 'ACTIVE',
    systemStatus: 'Online',
    systemHealth: 'Normal',
    sensorOnline: true,
    deviceResponding: true,
    networkStatus: 'Connected',
    firmwareVersion: '1.4.2',
    hardwareStatus: 'OK'
  },
  {
    systemId: 'SYS-2026-002',
    region: 'Ganja',
    location: { latitude: 40.6828, longitude: 46.3606 },
    soilMoisture: 45,
    temperature: 26,
    humidity: 48,
    pumpStatus: 'OFF',
    waterTankLevel: 85,
    batteryLevel: 77,
    solarStatus: 'CHARGING',
    systemStatus: 'Online',
    systemHealth: 'Normal',
    sensorOnline: true,
    deviceResponding: true,
    networkStatus: 'Connected',
    firmwareVersion: '1.4.0',
    hardwareStatus: 'OK'
  },
  {
    systemId: 'SYS-2026-003',
    region: 'Sheki',
    location: { latitude: 41.1919, longitude: 47.1706 },
    soilMoisture: 70,
    temperature: 22,
    humidity: 62,
    pumpStatus: 'ON',
    waterTankLevel: 60,
    batteryLevel: 69,
    solarStatus: 'ACTIVE',
    systemStatus: 'Online',
    systemHealth: 'Normal',
    sensorOnline: true,
    deviceResponding: true,
    networkStatus: 'Connected',
    firmwareVersion: '1.3.9',
    hardwareStatus: 'OK'
  },
  {
    systemId: 'SYS-2026-004',
    region: 'Lankaran',
    location: { latitude: 38.7539, longitude: 48.8509 },
    soilMoisture: 28,
    temperature: 30,
    humidity: 72,
    pumpStatus: 'OFF',
    waterTankLevel: 25,
    batteryLevel: 19,
    solarStatus: 'INACTIVE',
    systemStatus: 'Warning',
    systemHealth: 'Warning',
    sensorOnline: true,
    deviceResponding: true,
    networkStatus: 'Poor',
    firmwareVersion: '1.2.4',
    hardwareStatus: 'Warning'
  },
  {
    systemId: 'SYS-2026-005',
    region: 'Sumgait',
    location: { latitude: 40.5897, longitude: 49.6686 },
    soilMoisture: 0,
    temperature: 0,
    humidity: 0,
    pumpStatus: 'OFF',
    waterTankLevel: 0,
    batteryLevel: 0,
    solarStatus: 'ERROR',
    systemStatus: 'Offline',
    systemHealth: 'Critical',
    sensorOnline: false,
    deviceResponding: false,
    networkStatus: 'Disconnected',
    firmwareVersion: '1.0.8',
    hardwareStatus: 'Fault'
  },
  {
    systemId: 'SYS-2026-006',
    region: 'Shamakhi',
    location: { latitude: 40.6314, longitude: 48.6364 },
    soilMoisture: 58,
    temperature: 23,
    humidity: 50,
    pumpStatus: 'OFF',
    waterTankLevel: 64,
    batteryLevel: 74,
    solarStatus: 'ACTIVE',
    systemStatus: 'Online',
    systemHealth: 'Normal',
    sensorOnline: true,
    deviceResponding: true,
    networkStatus: 'Connected',
    firmwareVersion: '1.4.1',
    hardwareStatus: 'OK'
  }
];

const discussions = [
  {
    title: 'Best practices for drip irrigation in cotton fields?',
    content: 'I have a 10-hectare cotton field and want to implement drip irrigation. What spacing should I use for the drip lines?',
    problemType: 'irrigation',
    category: 'irrigation-problems',
    tags: ['drip-irrigation', 'cotton', 'water-pressure'],
    views: 61,
    isSolved: true,
    isPinned: true
  },
  {
    title: 'Tomato leaf curl disease - need help!',
    content: 'My tomato plants are showing leaf curl symptoms. Leaves are yellowing and curling upward.',
    problemType: 'plant-disease',
    category: 'crop-diseases',
    tags: ['tomatoes', 'disease', 'leaf-curl'],
    views: 44,
    isSolved: false
  },
  {
    title: 'How to improve soil pH for grape cultivation?',
    content: 'My soil test shows pH 5.8, but grapes prefer 6.0-6.5. Which amendments should I apply?',
    problemType: 'soil-issues',
    category: 'soil-fertility',
    tags: ['grapes', 'soil-ph', 'amendments'],
    views: 35,
    isSolved: false
  },
  {
    title: 'Solar panel maintenance in dusty conditions',
    content: 'In dusty region, panels lose efficiency quickly. How often should I clean and what method is safest?',
    problemType: 'equipment-problems',
    category: 'equipment-devices',
    tags: ['solar', 'maintenance', 'dust'],
    views: 52,
    isSolved: true
  },
  {
    title: 'Unexpected water tank drops at night',
    content: 'Tank level drops by 20% overnight even when irrigation is off. Could this be a leak or sensor issue?',
    problemType: 'other',
    category: 'general-questions',
    tags: ['tank', 'leak', 'sensor'],
    views: 22,
    isSolved: false
  }
];

function buildOrderId(index) {
  const suffix = String(index + 1).padStart(4, '0');
  return `ORD-20260307-${suffix}`;
}

function randomChoice(list, index) {
  return list[index % list.length];
}

async function seedDatabase() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing data...');
    await Promise.all([
      Order.deleteMany({}),
      Message.deleteMany({}),
      Question.deleteMany({}),
      Discussion.deleteMany({}),
      Group.deleteMany({}),
      FarmerGroup.deleteMany({}),
      UserReputation.deleteMany({}),
      IrrigationSystem.deleteMany({}),
      SensorData.deleteMany({}),
      Alert.deleteMany({}),
      AdminAlert.deleteMany({}),
      SystemLog.deleteMany({}),
      Device.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    console.log('👥 Creating users...');
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return { ...user, password: hashedPassword };
      })
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    console.log('📦 Creating devices...');
    const createdDevices = await Device.insertMany(devices);
    console.log(`✅ Created ${createdDevices.length} devices`);

    console.log('🛒 Creating sample orders...');
    const sampleOrders = [
      {
        orderId: buildOrderId(0),
        user: createdUsers[1]._id,
        userName: createdUsers[1].name,
        userEmail: createdUsers[1].email,
        device: createdDevices[0]._id,
        deviceName: createdDevices[0].name,
        quantity: 1,
        price: createdDevices[0].price,
        totalAmount: createdDevices[0].price,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        trackingNumber: 'TRK-AG-0001',
        shippingAddress: { region: 'Ganja', city: 'Ganja', address: '123 Farm Street', zipCode: 'AZ2000', phone: '+994501234567' },
        notes: 'Please call before delivery',
        createdAt: new Date('2026-01-15')
      },
      {
        orderId: buildOrderId(1),
        user: createdUsers[2]._id,
        userName: createdUsers[2].name,
        userEmail: createdUsers[2].email,
        device: createdDevices[1]._id,
        deviceName: createdDevices[1].name,
        quantity: 2,
        price: createdDevices[1].price,
        totalAmount: createdDevices[1].price * 2,
        status: 'processing',
        paymentStatus: 'paid',
        paymentMethod: 'bank-transfer',
        shippingAddress: { region: 'Sheki', city: 'Sheki', address: '456 Vineyard Road', zipCode: 'AZ5500', phone: '+994551234567' },
        createdAt: new Date('2026-02-01')
      },
      {
        orderId: buildOrderId(2),
        user: createdUsers[3]._id,
        userName: createdUsers[3].name,
        userEmail: createdUsers[3].email,
        device: createdDevices[2]._id,
        deviceName: createdDevices[2].name,
        quantity: 1,
        price: createdDevices[2].price,
        totalAmount: createdDevices[2].price,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: 'cash-on-delivery',
        shippingAddress: { region: 'Lankaran', city: 'Lankaran', address: '789 Tea Plantation Lane', zipCode: 'AZ4200', phone: '+994701234567' },
        createdAt: new Date('2026-02-08')
      },
      {
        orderId: buildOrderId(3),
        user: createdUsers[4]._id,
        userName: createdUsers[4].name,
        userEmail: createdUsers[4].email,
        device: createdDevices[5]._id,
        deviceName: createdDevices[5].name,
        quantity: 1,
        price: createdDevices[5].price,
        totalAmount: createdDevices[5].price,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        shippingAddress: { region: 'Quba', city: 'Quba', address: '14 Apple Valley', zipCode: 'AZ4000', phone: '+994507654321' },
        createdAt: new Date('2026-02-12')
      },
      {
        orderId: buildOrderId(4),
        user: createdUsers[5]._id,
        userName: createdUsers[5].name,
        userEmail: createdUsers[5].email,
        device: createdDevices[3]._id,
        deviceName: createdDevices[3].name,
        quantity: 3,
        price: createdDevices[3].price,
        totalAmount: createdDevices[3].price * 3,
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'bank-transfer',
        trackingNumber: 'TRK-AG-0005',
        shippingAddress: { region: 'Shamakhi', city: 'Shamakhi', address: '77 Vineyard Cross', zipCode: 'AZ5600', phone: '+994552224466' },
        createdAt: new Date('2026-02-19')
      },
      {
        orderId: buildOrderId(5),
        user: createdUsers[6]._id,
        userName: createdUsers[6].name,
        userEmail: createdUsers[6].email,
        device: createdDevices[4]._id,
        deviceName: createdDevices[4].name,
        quantity: 2,
        price: createdDevices[4].price,
        totalAmount: createdDevices[4].price * 2,
        status: 'cancelled',
        paymentStatus: 'refunded',
        paymentMethod: 'card',
        shippingAddress: { region: 'Saatli', city: 'Saatli', address: '9 Cotton Farm Road', zipCode: 'AZ6400', phone: '+994556667788' },
        notes: 'Cancelled due to delayed shipment',
        createdAt: new Date('2026-02-21')
      },
      {
        orderId: buildOrderId(6),
        user: createdUsers[7]._id,
        userName: createdUsers[7].name,
        userEmail: createdUsers[7].email,
        device: createdDevices[1]._id,
        deviceName: createdDevices[1].name,
        quantity: 1,
        price: createdDevices[1].price,
        totalAmount: createdDevices[1].price,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'cash-on-delivery',
        shippingAddress: { region: 'Gabala', city: 'Gabala', address: '22 Orchard Lane', zipCode: 'AZ3600', phone: '+994709998877' },
        createdAt: new Date('2026-02-26')
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`✅ Created ${createdOrders.length} orders`);

    console.log('🚰 Creating irrigation systems...');
    const systemsWithOwners = irrigationSystems.map((system, index) => ({
      ...system,
      ownerId: createdUsers[(index % (createdUsers.length - 1)) + 1]._id,
      ownerName: createdUsers[(index % (createdUsers.length - 1)) + 1].name,
      installDate: new Date('2025-03-01'),
      lastMaintenance: new Date('2026-02-10'),
      lastActive: system.systemStatus === 'Offline' ? new Date(Date.now() - 70 * 60 * 1000) : new Date()
    }));
    const createdSystems = await IrrigationSystem.insertMany(systemsWithOwners);
    console.log(`✅ Created ${createdSystems.length} irrigation systems`);

    console.log('💬 Creating discussions...');
    const discussionsWithAuthors = discussions.map((discussion, index) => ({
      ...discussion,
      author: createdUsers[(index % (createdUsers.length - 1)) + 1]._id,
      solvedBy: discussion.isSolved ? createdUsers[0]._id : undefined,
      createdAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - index * 10 * 60 * 60 * 1000),
      lastActivityAt: new Date(Date.now() - index * 5 * 60 * 60 * 1000)
    }));
    const createdDiscussions = await Discussion.insertMany(discussionsWithAuthors);

    createdDiscussions[0].replies.push({
      author: createdUsers[0]._id,
      content: 'For cotton fields, use 60-75cm spacing between drip lines and keep pressure around 1.0-1.5 bar.',
      isHelpful: true,
      markedHelpfulBy: createdDiscussions[0].author
    });
    createdDiscussions[0].replies.push({
      author: createdUsers[5]._id,
      content: 'We also reduced clogging by adding a 120-micron filter before each zone valve.',
      isHelpful: false
    });
    await createdDiscussions[0].save();

    createdDiscussions[3].replies.push({
      author: createdUsers[0]._id,
      content: 'Use a soft brush and clean early morning; avoid abrasive cleaning during peak sunlight.',
      isHelpful: true,
      markedHelpfulBy: createdDiscussions[3].author
    });
    await createdDiscussions[3].save();

    console.log(`✅ Created ${createdDiscussions.length} discussions`);

    console.log('🏆 Creating user reputation records...');
    const reputations = createdUsers.map((user, index) => ({
      user: user._id,
      points: [1250, 320, 580, 150, 260, 410, 190, 500][index],
      statistics: {
        totalAnswers: [87, 24, 38, 12, 18, 26, 14, 33][index],
        helpfulAnswers: [45, 12, 22, 6, 9, 15, 7, 20][index],
        totalPosts: [23, 15, 19, 8, 11, 16, 9, 18][index],
        totalHelpfulVotes: [52, 18, 28, 9, 12, 19, 10, 27][index]
      }
    }));
    const createdReputations = await UserReputation.insertMany(reputations);
    console.log(`✅ Created ${createdReputations.length} reputation records`);

    console.log('👥 Creating farmer groups...');
    const farmerGroups = [
      {
        name: 'Cotton Farmers Azerbaijan',
        description: 'Community for cotton farmers to share experiences and best practices',
        creator: createdUsers[1]._id,
        type: 'public',
        category: 'crops',
        tags: ['cotton', 'farming', 'advice'],
        posts: [{ author: createdUsers[1]._id, content: 'Welcome to our cotton farming community! Feel free to share your experiences and ask questions.', createdAt: new Date('2026-01-10') }]
      },
      {
        name: 'Smart Irrigation Users',
        description: 'Group for users of smart irrigation systems and technology',
        creator: createdUsers[0]._id,
        type: 'public',
        category: 'irrigation',
        tags: ['irrigation', 'technology', 'smart-farming'],
        posts: [
          { author: createdUsers[0]._id, content: 'Share your smart irrigation setups and tips here!', createdAt: new Date('2026-01-20') },
          { author: createdUsers[2]._id, content: 'Just installed AGRANOVA Controller Pro - works amazing!', createdAt: new Date('2026-02-01') }
        ]
      },
      {
        name: 'Organic Farming Azerbaijan',
        description: 'For farmers interested in organic and sustainable agriculture',
        creator: createdUsers[2]._id,
        type: 'public',
        category: 'crops',
        tags: ['organic', 'sustainable', 'eco-friendly']
      },
      {
        name: 'Equipment Discussions',
        description: 'Discuss agricultural equipment, maintenance, and recommendations',
        creator: createdUsers[3]._id,
        type: 'public',
        category: 'equipment',
        tags: ['equipment', 'machinery', 'maintenance']
      }
    ];

    const createdFarmerGroups = await FarmerGroup.insertMany(farmerGroups);
    for (const group of createdFarmerGroups) {
      const membersToAdd = createdUsers.slice(0, 5).filter((user) => !group.members.some((member) => member.user.equals(user._id)));
      for (const member of membersToAdd.slice(0, 3)) {
        group.members.push({ user: member._id, role: 'member' });
      }
      await group.save();
    }
    console.log(`✅ Created ${createdFarmerGroups.length} farmer groups`);

    console.log('👥 Creating chat groups/messages/questions...');
    const chatGroups = await Group.insertMany([
      {
        name: 'Irrigation Troubleshooting',
        description: 'Quick help for pumps, valves, and field controllers',
        creator: createdUsers[0]._id,
        members: [createdUsers[0]._id, createdUsers[1]._id, createdUsers[2]._id]
      },
      {
        name: 'Soil & Nutrient Clinic',
        description: 'Discuss pH, salinity, and nutrient balancing',
        creator: createdUsers[2]._id,
        members: [createdUsers[2]._id, createdUsers[3]._id, createdUsers[4]._id, createdUsers[5]._id]
      },
      {
        name: 'Regional Weather Watch',
        description: 'Share weather risks and field protection tips',
        creator: createdUsers[6]._id,
        members: [createdUsers[6]._id, createdUsers[1]._id, createdUsers[7]._id]
      }
    ]);

    const messages = [
      { group: chatGroups[0]._id, sender: createdUsers[1]._id, content: 'Pump starts and stops every 5 minutes. Could this be pressure instability?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { group: chatGroups[0]._id, sender: createdUsers[0]._id, content: 'Check line pressure and clean the inlet filter. Cycling often means pressure drop.', timestamp: new Date(Date.now() - 110 * 60 * 1000) },
      { group: chatGroups[0]._id, sender: createdUsers[2]._id, content: 'We fixed this by replacing a leaking check valve in zone 3.', timestamp: new Date(Date.now() - 100 * 60 * 1000) },
      { group: chatGroups[1]._id, sender: createdUsers[3]._id, content: 'Is gypsum enough to reduce sodium in clay soil?', timestamp: new Date(Date.now() - 90 * 60 * 1000) },
      { group: chatGroups[1]._id, sender: createdUsers[4]._id, content: 'Use gypsum with proper drainage; do a follow-up soil test in 4-6 weeks.', timestamp: new Date(Date.now() - 80 * 60 * 1000) },
      { group: chatGroups[2]._id, sender: createdUsers[7]._id, content: 'Strong winds expected tomorrow in Gabala. Secure the sensor masts.', timestamp: new Date(Date.now() - 75 * 60 * 1000) }
    ];
    const createdMessages = await Message.insertMany(messages);

    const questions = await Question.insertMany([
      {
        user: createdUsers[1]._id,
        title: 'Best irrigation schedule for cotton in mid-season?',
        content: 'Soil moisture ranges between 38-52%. How many cycles per day are optimal in hot weeks?',
        tags: ['cotton', 'schedule', 'irrigation'],
        views: 95,
        answers: [
          {
            user: createdUsers[0]._id,
            content: 'Use shorter, more frequent cycles and keep root-zone moisture near field capacity.',
            isBestAnswer: true,
            votes: 7
          },
          {
            user: createdUsers[5]._id,
            content: 'We run 2 morning cycles + 1 evening cycle during heat peaks.',
            votes: 3
          }
        ]
      },
      {
        user: createdUsers[4]._id,
        title: 'How to calibrate moisture sensors after installation?',
        content: 'New sensors show high variance between nearby probes. What is a reliable calibration process?',
        tags: ['sensors', 'calibration', 'soil-moisture'],
        views: 58,
        answers: [
          {
            user: createdUsers[0]._id,
            content: 'Calibrate against gravimetric samples at two moisture points: near dry and field capacity.',
            votes: 5
          }
        ]
      },
      {
        user: createdUsers[7]._id,
        title: 'Night irrigation vs day irrigation for orchards?',
        content: 'I want to reduce evaporation losses. Is full night irrigation recommended?',
        tags: ['orchard', 'evaporation', 'efficiency'],
        views: 34,
        answers: []
      }
    ]);

    console.log(`✅ Created ${chatGroups.length} groups, ${createdMessages.length} messages, ${questions.length} questions`);

    console.log('📈 Creating sensor history and alerts...');
    const sensorHistory = [];
    const now = Date.now();
    for (let hour = 47; hour >= 0; hour -= 1) {
      const timestamp = new Date(now - hour * 60 * 60 * 1000);
      sensorHistory.push({
        soilMoisture: Math.max(18, Math.min(78, 48 + Math.floor(Math.sin(hour / 4) * 14))),
        temperature: Math.max(13, Math.min(36, 24 + Math.floor(Math.cos(hour / 6) * 6))),
        humidity: Math.max(30, Math.min(88, 58 + Math.floor(Math.sin(hour / 5) * 15))),
        waterTankLevel: Math.max(12, Math.min(92, 72 - (47 - hour) * 1.1)),
        pumpStatus: hour % 5 === 0 ? 'ON' : 'OFF',
        solarPanelStatus: randomChoice(['ACTIVE', 'CHARGING', 'ACTIVE', 'INACTIVE'], hour),
        solarPanelAngle: randomChoice([25, 35, 45, 55], hour),
        batteryLevel: Math.max(18, 90 - Math.floor((47 - hour) * 1.3)),
        timestamp
      });
    }
    const createdSensorData = await SensorData.insertMany(sensorHistory);

    const createdAlerts = await Alert.insertMany([
      {
        type: 'LOW_WATER',
        severity: 'WARNING',
        message: 'Water tank level dropped to 18% in SYS-2026-004',
        isRead: false,
        timestamp: new Date(Date.now() - 35 * 60 * 1000)
      },
      {
        type: 'BATTERY_LOW',
        severity: 'WARNING',
        message: 'Battery level is 19% in SYS-2026-004',
        isRead: false,
        timestamp: new Date(Date.now() - 70 * 60 * 1000)
      },
      {
        type: 'IRRIGATION_START',
        severity: 'INFO',
        message: 'Irrigation started automatically for zone 2',
        isRead: true,
        timestamp: new Date(Date.now() - 140 * 60 * 1000)
      },
      {
        type: 'IRRIGATION_STOP',
        severity: 'INFO',
        message: 'Irrigation cycle completed successfully',
        isRead: true,
        timestamp: new Date(Date.now() - 210 * 60 * 1000)
      }
    ]);

    const createdAdminAlerts = await AdminAlert.insertMany([
      {
        systemId: 'SYS-2026-004',
        systemOwnerId: createdUsers[3]._id,
        ownerName: createdUsers[3].name,
        region: 'Lankaran',
        alertType: 'NETWORK_FAILURE',
        severity: 'WARNING',
        message: 'Poor network connectivity detected',
        details: 'Packet loss above 18% for last 20 minutes',
        isRead: false,
        isResolved: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        systemId: 'SYS-2026-005',
        systemOwnerId: createdUsers[4]._id,
        ownerName: createdUsers[4].name,
        region: 'Sumgait',
        alertType: 'SYSTEM_OFFLINE',
        severity: 'CRITICAL',
        message: 'System is offline',
        details: 'No telemetry received in last 60 minutes',
        isRead: false,
        isResolved: false,
        createdAt: new Date(Date.now() - 90 * 60 * 1000)
      },
      {
        systemId: 'SYS-2026-006',
        systemOwnerId: createdUsers[5]._id,
        ownerName: createdUsers[5].name,
        region: 'Shamakhi',
        alertType: 'BATTERY_CRITICAL',
        severity: 'WARNING',
        message: 'Battery trending lower than expected',
        details: 'Battery projection below 20% in next 8 hours',
        isRead: true,
        isResolved: false,
        createdAt: new Date(Date.now() - 150 * 60 * 1000)
      }
    ]);

    const logRows = [];
    createdSystems.forEach((system, systemIndex) => {
      for (let i = 0; i < 12; i += 1) {
        logRows.push({
          systemId: system.systemId,
          logType: randomChoice(['INFO', 'WARNING', 'SYSTEM', 'SENSOR', 'NETWORK'], i + systemIndex),
          action: randomChoice(['Sensor Reading', 'Pump Control', 'Health Check', 'Network Ping', 'Auto-Irrigation'], i + systemIndex),
          message: `Telemetry event ${i + 1} for ${system.systemId}`,
          data: {
            soilMoisture: Math.max(10, Math.min(85, system.soilMoisture + (i % 3) - 1)),
            batteryLevel: Math.max(0, system.batteryLevel - i),
            eventIndex: i + 1
          },
          timestamp: new Date(Date.now() - (i + 1) * 30 * 60 * 1000)
        });
      }
    });

    const createdSystemLogs = await SystemLog.insertMany(logRows);

    console.log(`✅ Created ${createdSensorData.length} sensor rows`);
    console.log(`✅ Created ${createdAlerts.length} alerts`);
    console.log(`✅ Created ${createdAdminAlerts.length} admin alerts`);
    console.log(`✅ Created ${createdSystemLogs.length} system logs`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${createdUsers.length} users`);
    console.log(`   - ${createdDevices.length} devices`);
    console.log(`   - ${createdOrders.length} orders`);
    console.log(`   - ${createdSystems.length} irrigation systems`);
    console.log(`   - ${createdDiscussions.length} discussions`);
    console.log(`   - ${createdReputations.length} reputation records`);
    console.log(`   - ${createdFarmerGroups.length} farmer groups`);
    console.log(`   - ${chatGroups.length} community groups`);
    console.log(`   - ${createdMessages.length} community messages`);
    console.log(`   - ${questions.length} Q&A questions`);
    console.log(`   - ${createdSensorData.length} sensor data rows`);
    console.log(`   - ${createdAlerts.length} alerts`);
    console.log(`   - ${createdAdminAlerts.length} admin alerts`);
    console.log(`   - ${createdSystemLogs.length} system logs\n`);

    console.log('🔐 Login credentials:');
    console.log('   Admin: admin@agranova.com / admin123');
    console.log('   User 1: rashad@farmer.com / user123');
    console.log('   User 2: leyla@farm.az / user123');
    console.log('   User 3: kamran@agro.az / user123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
