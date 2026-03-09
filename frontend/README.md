# CryptoRisk Frontend

Single-page application for the CryptoRisk product. Provides landing, sign-in (username/password and Google OAuth), profile management, and risk metrics calculation with a dashboard-style UI.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** React 18
- **Language:** TypeScript
- **Build:** Vite 5
- **Styling:** Tailwind CSS
- **Data:** Apollo Client (GraphQL)
- **Routing:** React Router v6
- **Auth (Google):** @react-oauth/google

## Prerequisites

- Node.js 18+ and npm
- Backend running (default: `http://localhost:8080`) and GraphQL at `/query`
- Optional: Google OAuth Web client for "Sign in with Google"

## Environment Variables

Create a `.env` file in the frontend directory. Use `.env.example` as a template if present.

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web client ID. If set, the app shows "Continue with Google" and uses the backend `loginGoogle` mutation with the Google ID token. If unset, only username/password sign-in is offered. |

All client env vars must be prefixed with `VITE_` so Vite exposes them to the app.

## Install and Run

```bash
# Install dependencies
npm install

# Development (hot reload)
npm run dev
```

The app is served at `http://localhost:3000`. The dev server proxies `/query` to `http://localhost:8080`, so the backend must be running for GraphQL to work.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (port 3000, proxy to backend) |
| `npm run build` | TypeScript compile and production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Build and Deploy

```bash
npm run build
```

Output is in `dist/`. Serve the contents with any static host. Ensure the production API base URL matches your deployment (proxy or absolute URL to the backend `/query`).

## Features

- **Landing:** Marketing-style landing with navigation and sign-in entry.
- **Sign-in:** Username/password and optional Google OAuth; JWT stored in localStorage and sent in `Authorization` for API calls.
- **Dashboard (Profile):** List and manage wallet/contract profiles (add/remove). Used as input for metrics.
- **Calculate Metrics:** Select profiles and a time window (days), run metrics query, view paginated results (e.g. total balance, volatility, drawdown, Gini). Click a card to open a detail modal with descriptions and high/medium/low level indicators.

## Project Layout

- `src/pages/` – Route-level components (Landing, Login, Profile, Calculate Metrics)
- `src/components/` – Shared UI (AppShell, DashboardShell, Card, Button, etc.)
- `src/contexts/` – Auth context (token, username, logout)
- `src/lib/` – Apollo client and GraphQL operations
- `public/` – Static assets (e.g. default token logo)
- `index.html` – Entry HTML; `src/main.tsx` – React entry

## License

Proprietary. All rights reserved.
