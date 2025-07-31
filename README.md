# Feelynx - Premium Live Streaming Platform

A modern, full-stack web application for live streaming, creator monetization, and interactive experiences built with React, TypeScript, LiveKit, and Express.

## 🚀 Features

- **Live Streaming**: Real-time video streaming with LiveKit WebRTC
- **Creator Dashboard**: Stream management, analytics, and earnings tracking  
- **Interactive Chat**: Real-time messaging during streams
- **Monetization**: VibeCoin purchases and creator tipping system
- **Responsive Design**: Mobile-first responsive UI with dark theme
- **Real-time Updates**: WebSocket-based live status updates

## 🛠 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui components
- LiveKit client for WebRTC
- React Router for navigation
- TanStack Query for state management

**Backend:**
- Node.js + Express + TypeScript
- LiveKit server SDK
- WebSocket for real-time updates
- Prisma ORM + PostgreSQL
- Payment processing (Stripe-ready)

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- LiveKit server (included in Docker setup)

## ⚡ Quick Start

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd feelynx-web-app
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development servers:**
```bash
# Start all services with Docker
npm run docker:up

# Or start manually:
npm run dev:server  # Backend on :3001
npm run dev         # Frontend on :8080
```

4. **Access the application:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001  
- LiveKit: http://localhost:7880

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example`):

```env
# LiveKit Configuration
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_secret
VITE_LIVEKIT_WS_URL=ws://localhost:7880

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/feelynx

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
```

## 🏗 Production Deployment

1. **Build the application:**
```bash
npm run build
npm run build:server
```

2. **Deploy using Docker:**
```bash
docker-compose up -d
```

3. **Environment setup:**
- Set production LiveKit server URL
- Configure production database
- Set up Stripe webhook endpoints
- Enable HTTPS/SSL certificates

## 📚 API Documentation

### LiveKit Endpoints
- `GET /livekit/token` - Get room access token
- `POST /livekit/rooms` - Create new room
- `GET /livekit/rooms` - List active rooms
- `DELETE /livekit/rooms/:room` - Delete room

### Creator Endpoints  
- `GET /api/creators` - Get creators with filtering
- `POST /creators/:username/status` - Update live status

### Payment Endpoints
- `POST /api/payments/create-session` - Create payment session
- `GET /api/payments/balance/:userId` - Get user balance

## 🔐 Security Notes

- LiveKit tokens are generated server-side only
- Environment variables contain sensitive API keys
- CORS is configured for specific origins
- All user inputs are validated and sanitized

## 🧪 Testing

```bash
npm test  # Unit and integration tests
npm run lint  # Code linting
```

## 📱 Features Overview

### For Viewers
- Browse live creators with filters
- Join live streams with video/audio
- Interactive chat and tipping
- Purchase VibeCoin packages
- Mobile-responsive experience

### For Creators  
- Go live with camera/microphone
- Real-time viewer analytics
- Earnings tracking and tips
- Stream management dashboard
- Interactive controls and moderation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For technical support or questions:
- Check the documentation
- Review error logs in browser console
- Ensure all environment variables are properly set
- Verify LiveKit server is running and accessible

---

Built with ❤️ for the creator economy