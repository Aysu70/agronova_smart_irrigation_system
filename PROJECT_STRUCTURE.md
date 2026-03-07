# AGRANOVA - Smart Agriculture Platform

## Project Structure

```
agronova_smart_irrigation_system/
│
├── backend/                          # Node.js Express Backend
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.js
│   │   │   └── socket.js
│   │   ├── models/                   # MongoDB Models
│   │   │   ├── User.js
│   │   │   ├── SensorData.js
│   │   │   ├── Alert.js
│   │   │   ├── Group.js
│   │   │   ├── Message.js
│   │   │   └── Question.js
│   │   ├── routes/                   # API Routes
│   │   │   ├── auth.js
│   │   │   ├── sensors.js
│   │   │   ├── irrigation.js
│   │   │   ├── alerts.js
│   │   │   ├── community.js
│   │   │   └── ai.js
│   │   ├── controllers/              # Business Logic
│   │   │   ├── authController.js
│   │   │   ├── sensorController.js
│   │   │   ├── irrigationController.js
│   │   │   ├── communityController.js
│   │   │   └── aiController.js
│   │   ├── middleware/               # Middleware
│   │   │   └── auth.js
│   │   ├── services/                 # Services
│   │   │   ├── sensorService.js
│   │   │   └── aiService.js
│   │   └── server.js                 # Main Server File
│   ├── package.json
│   └── .env.example
│
├── frontend/                         # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/               # Reusable Components
│   │   │   ├── common/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── Loader.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── SensorCard.jsx
│   │   │   │   ├── PumpStatus.jsx
│   │   │   │   ├── SolarStatus.jsx
│   │   │   │   └── WaterTankGauge.jsx
│   │   │   ├── irrigation/
│   │   │   │   ├── AutoMode.jsx
│   │   │   │   └── ManualMode.jsx
│   │   │   ├── analytics/
│   │   │   │   ├── WaterUsageChart.jsx
│   │   │   │   ├── MoistureChart.jsx
│   │   │   │   └── TemperatureChart.jsx
│   │   │   ├── community/
│   │   │   │   ├── GroupList.jsx
│   │   │   │   ├── ChatRoom.jsx
│   │   │   │   ├── QuestionCard.jsx
│   │   │   │   └── UserProfile.jsx
│   │   │   └── ai/
│   │   │       └── AIChatBot.jsx
│   │   ├── pages/                    # Page Components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── IrrigationControl.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── context/                  # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── services/                 # API Services
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── hooks/                    # Custom Hooks
│   │   │   └── useSocket.js
│   │   ├── utils/                    # Utility Functions
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── docs/                             # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── FEATURES.md
│
└── README.md
```

## Technology Stack

### Frontend
- React 18
- TailwindCSS
- Recharts (Charts)
- Socket.io-client (Real-time)
- Axios (HTTP Client)
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.io (WebSockets)
- JWT (Authentication)
- OpenAI API (AI Assistant)

### DevOps
- nodemon (Development)
- dotenv (Environment Variables)
- cors (Cross-Origin Resource Sharing)
