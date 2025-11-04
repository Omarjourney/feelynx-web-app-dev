# Feelynx — Premium Live Streaming Platform

A modern, full-stack web application for live streaming, creator monetization, and interactive experiences built with React, TypeScript, LiveKit, and Express.

## 🚀 Features

- **Live Streaming**: Real-time video streaming with LiveKit WebRTC
- **Group Streaming**: Multiple hosts and viewer lists per room
- **Creator Dashboard**: Stream management, analytics, and earnings tracking
- **Interactive Chat**: Real-time messaging during streams
- **Monetization**: VibeCoin purchases and creator tipping system
- **Virtual Gifts**: Token-based gifts with leaderboards
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

See [docs/dependencies.md](docs/dependencies.md) for detailed guidance on supported package managers, lockfiles, and how we keep dependencies up to date.

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

> **Note:** The `.env` file is excluded from version control. Never commit your personal environment settings.

3. **Start development servers:**

```bash
# Start backend (Express + TS) on :3001
npm run dev:server

# Start frontend (Vite) on :8080 with proxy to backend
npm run dev

# Optional: bring up demo LiveKit via Docker Compose
docker-compose up -d livekit
```

4. **Access the application:**

- Frontend: http://localhost:8080
- Backend API: http://localhost:3001
- LiveKit: http://localhost:7880

## 🧭 Codex CLI Access

The project now bundles a lightweight `codex` command-line tool that helps you inspect and navigate the repository without leaving your terminal.

### Install (once per clone)

```bash
npm install
```

### Usage

Run the CLI through `npx` (or `npm run codex -- <command>`):

```bash
# Show the built-in documentation
npx codex help

# Display repo metadata and useful scripts
npx codex info

# List folders relative to the repo root
npx codex ls src

# Print a file directly to the terminal
npx codex cat README.md
```

Each command resolves paths relative to the repository root and guards against accidentally leaving the project directory.

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for sample values):

```env
# LiveKit configuration
LIVEKIT_API_KEY=example_livekit_api_key
LIVEKIT_API_SECRET=example_livekit_api_secret
LIVEKIT_URL=http://localhost:7880
VITE_LIVEKIT_WS_URL=ws://localhost:7880

# Supabase configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Media assets
VITE_UNSPLASH_RANDOM_BASE_URL=https://source.unsplash.com/random/

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/feelynx

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
```

> **Note:** `LIVEKIT_API_SECRET` is for backend use only and must never be exposed to the frontend.

The frontend configuration reads these variables at runtime via `src/config/index.ts`. Missing values cause the application to throw during startup so misconfigured builds fail fast. Ensure `VITE_UNSPLASH_RANDOM_BASE_URL` ends with a trailing slash so asset paths resolve correctly.

The application streams over WebRTC using [LiveKit Cloud](https://docs.livekit.io/home/cloud/).

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

- Set production `LIVEKIT_URL`
- Configure production database
- Set up Stripe webhook endpoints
- Enable HTTPS/SSL certificates

## 📚 API Documentation

### LiveKit Endpoints

- `POST /livekit/token` - Get room access token
- `POST /livekit/rooms` - Create new room
- `GET /livekit/rooms` - List active rooms
- `DELETE /livekit/rooms/:room` - Delete room

### Creator Endpoints

- `GET /api/creators` - Get creators with filtering
- `POST /creators/:username/status` - Update live status

### Payment Endpoints

- `POST /api/payments/create-session` - Create payment session
- `GET /api/payments/balance/:userId` - Get user balance

### Gift Endpoints

- `GET /api/gifts/catalog` - List available gifts
- `POST /api/gifts/balance/:userId/purchase` - Add tokens to a user's balance
- `POST /api/gifts/send` - Send a gift to a creator
- `GET /api/gifts/leaderboard/:creatorId` - Top fans for a creator

## 🔐 Security Notes

- LiveKit tokens are generated server-side only
- Environment variables contain sensitive API keys
- CORS is configured for specific origins
- All user inputs are validated and sanitized

### Automated Security & Compliance Checks

CI runs a trio of security-focused jobs. You can execute the same checks locally before pushing changes:

| Check            | Command                                            | Purpose                                                                                                            |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Security lint    | `npm run lint:security`                            | Runs ESLint with additional accessibility and security rules (`eslint-plugin-security`, `eslint-plugin-jsx-a11y`). |
| Dependency audit | `npm audit --production --audit-level=high`        | Fails if production dependencies contain high or critical vulnerabilities.                                         |
| Secret scan      | `npx gitleaks detect --source=. --no-git --redact` | Scans the working tree for leaked secrets using Gitleaks.                                                          |

The CI workflow will fail if any of the above commands report an issue. Remediate vulnerabilities or false positives before opening a pull request, and document any accepted risks in code comments or the issue tracker.

## 🧪 Testing

```bash
npm test  # Unit and integration tests
npm run lint  # Code linting
npm run test:e2e  # Playwright end-to-end tests (see docs/testing.md)
```

## 🧹 Code Quality

- `npm run format` – Check formatting with Prettier (runs automatically in the pre-commit hook).
- `npm run format:fix` – Format the entire codebase with Prettier.
- `npm run lint` – Run ESLint with the shared TypeScript + Prettier configuration.

> Husky installs a pre-commit hook during `npm install` (via the `prepare` script). The hook runs `npm run lint` and `npm run format` to keep commits clean. If you ever need to re-install the hooks, run `npm run prepare`.

## 🎥 Camera & Microphone Troubleshooting

- The app only accesses camera and microphone from secure origins (HTTPS) or `localhost`.
- If the browser denies access, enable camera/mic permissions in both your browser and operating system settings and reload the page.
- On unsupported devices or browsers, try the latest versions of Chrome, Firefox, or Safari.
- To test locally, run the app on `https://` or `http://localhost` and verify that permission prompts appear.
- If testing on a non-HTTPS host, add it to `VITE_MEDIA_HOST_WHITELIST` in `.env` to allow camera access.

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

> Remember to create your local `.env` from `.env.example` and keep it out of version control.

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
