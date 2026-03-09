# CryptoRisk Application

CryptoRisk is a full-stack application for analyzing cryptocurrency wallet and portfolio risk. It provides balance volatility, drawdown, and distribution metrics over configurable time windows.

## Project Structure

```
cryptorisk/
├── backend/     Go GraphQL API (gqlgen, Chi, MongoDB, JWT, Google OAuth)
├── frontend/    React + TypeScript SPA (Vite, Tailwind, Apollo Client)
└── README.md    This file
```

## Prerequisites

- Go 1.24+ (backend)
- Node.js 18+ and npm (frontend)
- MongoDB (backend data store)
- Google Cloud OAuth client (optional; for Google sign-in on the frontend)

## Quick Start

1. **Backend**
   - See `backend/README.md` for environment variables and run instructions.
   - Start the API (default: `http://localhost:8080`). The root path serves the GraphQL Playground; the API endpoint is `/query`.

2. **Frontend**
   - See `frontend/README.md` for setup and environment variables.
   - From `frontend/`, run `npm install` then `npm run dev`. The app runs at `http://localhost:3000` and proxies GraphQL requests to the backend.

3. **Usage**
   - Open the frontend in a browser. Sign in (username/password or Google OAuth if configured). Add wallet profiles in the Dashboard, then use Calculate Metrics to run risk analytics over a chosen time window.

## Documentation

- Backend: `backend/README.md`
- Frontend: `frontend/README.md`

## License

Proprietary. All rights reserved.
