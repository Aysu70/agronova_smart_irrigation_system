# 🌱 AGRANOVA - Smart Agriculture Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://www.mongodb.com/)

> A complete, production-ready smart agriculture platform for IoT-based irrigation monitoring and control, farmer community, and AI-powered agricultural assistance.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

AGRANOVA is a comprehensive smart agriculture system that combines IoT sensor monitoring, automated irrigation control, real-time analytics, farmer community features, and AI-powered agricultural assistance. Built with modern web technologies, it provides a professional, scalable solution for smart farming operations.

### Key Highlights

- 📊 **Real-time Monitoring**: Track soil moisture, temperature, humidity, and system status
- 💧 **Smart Irrigation**: Automatic and manual irrigation modes with intelligent scheduling
- 📈 **Advanced Analytics**: Historical data visualization with exportable reports
- 👥 **Farmer Community**: Group chat, Q&A forums, and knowledge sharing
- 🤖 **AI Assistant**: Specialized agricultural advisor powered by OpenAI (agriculture topics only)
- ⚡ **Real-time Updates**: WebSocket-based live data streaming
- 🔐 **Secure Authentication**: JWT-based user authentication and authorization
- ☀️ **Solar Tracking**: Monitor solar panel positioning and battery levels
- 💦 **Water Management**: Track water tank levels and usage patterns

## ✨ Features

### 1. Dashboard (Real-time Monitoring)
- Live sensor data display (moisture, temperature, humidity)
- Water tank level gauge with visual indicators
- Pump status monitoring
- Solar panel tracking and battery level
- Real-time WebSocket updates

### 2. Irrigation Control Panel
**Automatic Mode:**
- Set moisture threshold for auto-irrigation
- Visual threshold indicator
- Automatic pump activation

**Manual Mode:**
- Direct pump ON/OFF control
- Timer-based irrigation (5-60 minutes)
- Real-time status updates

### 3. Alert and Notification System
- Low water level alerts
- Battery level warnings
- Irrigation start/stop notifications
- System status changes
- Real-time push notifications via WebSocket

### 4. Statistics and Analytics
- Daily water usage charts
- Weekly moisture trends
- Temperature and humidity history
- Exportable data (CSV format)
- Multi-period analysis (24h, 7d, 30d)

### 5. Farmer Community System
**Groups:**
- Create public/private groups
- Real-time group chat
- Member management
- Image sharing support

**Q&A Forum:**
- Post agricultural questions
- Community answers
- Best answer selection
- Topic tagging

### 6. AI Agriculture Assistant
- Natural language conversation
- Agriculture-specific knowledge base
- Topic filtering (agriculture only)
- Practical farming advice
- Friendly, supportive responses

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **TailwindCSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Socket.io-client** - Real-time communication
- **Axios** - HTTP client
- **React Router DOM** - Navigation
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **OpenAI API** - AI assistant (optional)

### DevOps & Tools
- **nodemon** - Development auto-reload
- **dotenv** - Environment variables
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

## 📁 Project Structure

```
agronova_smart_irrigation_system/
│
├── backend/                      # Node.js Backend
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   ├── models/              # MongoDB models
│   │   ├── routes/              # API routes
│   │   ├── controllers/         # Business logic
│   │   ├── middleware/          # Authentication middleware
│   │   ├── services/            # Service layer
│   │   └── server.js            # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── context/             # React context
│   │   ├── services/            # API services
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Main app component
│   │   └── index.jsx            # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── docs/                         # Documentation
└── README.md
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **MongoDB** v6 or higher ([Download](https://www.mongodb.com/try/download/community))
- **npm** or **yarn** package manager
- **Git** (optional)

## 🚀 Installation

### Step 1: Clone or Download the Project

```bash
# If using Git
git clone https://github.com/yourusername/agronova_smart_irrigation_system.git
cd agronova_smart_irrigation_system

# Or download and extract the ZIP file
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Set MongoDB URI, JWT secret, and OpenAI API key (optional)
```

**Backend .env Configuration:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/agranova
JWT_SECRET=your_secure_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional
FRONTEND_URL=http://localhost:3000
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Frontend .env Configuration:**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 4: Start MongoDB

```bash
# On Windows (if installed as service)
net start MongoDB

# On macOS/Linux
mongod --dbpath /path/to/your/data/directory

# Or use MongoDB Compass or MongoDB Atlas cloud service
```

## 🎮 Running the Application

### Development Mode (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder with a static server
```

## 👤 Default User Credentials

For testing, you can create a new account via the register page, or use these test credentials if you seed the database:

```
Email: demo@agranova.com
Password: demo123
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Sensor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sensors/latest` | Get latest sensor data |
| GET | `/api/sensors/history?period=7d` | Get historical data |
| POST | `/api/sensors` | Create sensor data (IoT) |

### Irrigation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/irrigation/config` | Get irrigation config |
| PUT | `/api/irrigation/config` | Update config |
| POST | `/api/irrigation/pump` | Control pump |
| GET | `/api/irrigation/stats` | Get statistics |

### Community Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/groups` | Get all groups |
| POST | `/api/community/groups` | Create group |
| GET | `/api/community/groups/:id/messages` | Get messages |
| POST | `/api/community/groups/:id/messages` | Send message |
| GET | `/api/community/questions` | Get all questions |
| POST | `/api/community/questions` | Create question |

### AI Assistant Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI assistant |

For complete API documentation, see [API.md](docs/API.md)

## 🎨 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Irrigation Control
![Irrigation](docs/screenshots/irrigation.png)

### Analytics
![Analytics](docs/screenshots/analytics.png)

### Community
![Community](docs/screenshots/community.png)

### AI Assistant
![AI Assistant](docs/screenshots/ai-assistant.png)

## 🔧 Development

### Adding New Features

1. **Backend**: Add routes in `backend/src/routes/`, controllers in `backend/src/controllers/`
2. **Frontend**: Add components in `frontend/src/components/`, pages in `frontend/src/pages/`

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MongoDB URI in `.env` file
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Backend default port: 5000 (change in backend/.env)
- Frontend default port: 3000 (change port in package.json)

### WebSocket Connection Failed
- Ensure both frontend and backend are running
- Check CORS configuration
- Verify WebSocket URL in frontend/.env

### OpenAI API Issues
- The system works without OpenAI API (uses mock responses)
- To enable AI features, add valid `OPENAI_API_KEY` in backend/.env

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**AGRANOVA Team**

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database
- OpenAI for AI capabilities
- All open-source contributors

## 📞 Support

For support, email support@agranova.com or open an issue on GitHub.

---

**Made with ❤️ for sustainable agriculture**