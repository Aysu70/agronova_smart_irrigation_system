export const DEMO_USERS = [
  {
    _id: 'demo-user-1',
    name: 'Admin User',
    email: 'admin@agranova.com',
    role: 'admin',
    region: 'baku',
    crops: ['Tomatoes', 'Wheat'],
    createdAt: '2026-01-03T10:00:00.000Z'
  },
  {
    _id: 'demo-user-2',
    name: 'Rashad Mammadov',
    email: 'rashad@farmer.com',
    role: 'user',
    region: 'ganja',
    crops: ['Cotton', 'Barley'],
    createdAt: '2026-01-05T09:30:00.000Z'
  },
  {
    _id: 'demo-user-3',
    name: 'Leyla Hasanova',
    email: 'leyla@farm.az',
    role: 'user',
    region: 'sheki',
    crops: ['Grapes', 'Apples'],
    createdAt: '2026-01-07T08:15:00.000Z'
  },
  {
    _id: 'demo-user-4',
    name: 'Kamran Aliyev',
    email: 'kamran@agro.az',
    role: 'user',
    region: 'lankaran',
    crops: ['Tea', 'Rice'],
    createdAt: '2026-01-10T11:45:00.000Z'
  },
  {
    _id: 'demo-user-5',
    name: 'Aysel Quliyeva',
    email: 'aysel@agro.az',
    role: 'user',
    region: 'quba',
    crops: ['Hazelnut', 'Potato'],
    createdAt: '2026-01-14T14:05:00.000Z'
  },
  {
    _id: 'demo-user-6',
    name: 'Tural Ismayilov',
    email: 'tural@farmer.az',
    role: 'user',
    region: 'shamakhi',
    crops: ['Grapes', 'Wheat'],
    createdAt: '2026-01-18T13:25:00.000Z'
  }
];

export const DEMO_ORDERS = [
  {
    _id: 'demo-order-1',
    orderId: 'ORD-20260307-0001',
    userName: 'Rashad Mammadov',
    userEmail: 'rashad@farmer.com',
    deviceName: 'AGRANOVA Smart Controller Pro',
    quantity: 1,
    totalAmount: 1299,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    shippingAddress: {
      region: 'ganja',
      city: 'Ganja',
      address: '123 Farm Street'
    },
    createdAt: '2026-02-08T09:30:00.000Z'
  },
  {
    _id: 'demo-order-2',
    orderId: 'ORD-20260307-0002',
    userName: 'Leyla Hasanova',
    userEmail: 'leyla@farm.az',
    deviceName: 'AGRANOVA Sensor Kit Advanced',
    quantity: 2,
    totalAmount: 898,
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'bank-transfer',
    shippingAddress: {
      region: 'sheki',
      city: 'Sheki',
      address: '456 Vineyard Road'
    },
    createdAt: '2026-02-20T12:10:00.000Z'
  },
  {
    _id: 'demo-order-3',
    orderId: 'ORD-20260307-0003',
    userName: 'Kamran Aliyev',
    userEmail: 'kamran@agro.az',
    deviceName: 'Solar Water Pump System',
    quantity: 1,
    totalAmount: 899,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'cash-on-delivery',
    shippingAddress: {
      region: 'lankaran',
      city: 'Lankaran',
      address: '789 Tea Plantation Lane'
    },
    createdAt: '2026-02-24T15:45:00.000Z'
  },
  {
    _id: 'demo-order-4',
    orderId: 'ORD-20260307-0004',
    userName: 'Aysel Quliyeva',
    userEmail: 'aysel@agro.az',
    deviceName: 'Precision Drip Controller X2',
    quantity: 1,
    totalAmount: 649,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    shippingAddress: {
      region: 'quba',
      city: 'Quba',
      address: '14 Apple Valley'
    },
    createdAt: '2026-03-01T10:20:00.000Z'
  },
  {
    _id: 'demo-order-5',
    orderId: 'ORD-20260307-0005',
    userName: 'Tural Ismayilov',
    userEmail: 'tural@farmer.az',
    deviceName: 'Basic Irrigation Controller',
    quantity: 3,
    totalAmount: 897,
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'bank-transfer',
    shippingAddress: {
      region: 'shamakhi',
      city: 'Shamakhi',
      address: '77 Vineyard Cross'
    },
    createdAt: '2026-03-03T17:05:00.000Z'
  }
];

export const buildDemoDevices = (users, regionCoordinates, regionLabel) => {
  return users.map((user, index) => {
    const fallbackRegion = ['baku', 'ganja', 'sheki', 'lankaran', 'quba', 'shamakhi'][index % 6];
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
        address: `${regionLabel(region)}, Azerbaijan`
      },
      status: ['Active', 'Active', 'Offline', 'Maintenance'][index % 4],
      signalStrength: 55 + ((index * 9) % 40),
      lastActive: new Date(Date.now() - index * 60 * 60 * 1000),
      firmware: `v${1 + (index % 3)}.${(index + 2) % 10}.0`,
      model: ['AgroSmart Pro', 'AgroSmart Basic', 'AgroSmart Plus'][index % 3],
      sensors: {
        moisture: true,
        temperature: true,
        humidity: true,
        light: index % 2 === 0
      }
    };
  });
};