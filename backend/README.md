# CryptoRisk Backend

GraphQL API for the CryptoRisk application. Handles authentication (JWT, Google OAuth), user and profile management, and portfolio risk metrics computation.

## Tech Stack

- **Language:** Go 1.24+
- **API:** GraphQL (gqlgen)
- **Router:** Chi
- **Database:** MongoDB (go.mongodb.org/mongo-driver/v2)
- **Auth:** JWT (golang-jwt/jwt/v5), Google ID token verification (google.golang.org/api)
- **Env:** godotenv

## Prerequisites

- Go 1.24 or later
- MongoDB instance (local or remote)
- Optional: Google OAuth Client ID for `loginGoogle` mutation

## Environment Variables

Create a `.env` file in the backend directory. Typical variables:

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (default: 8080) |
| `JWTKEY` | Secret key for signing and verifying JWT tokens |
| MongoDB connection | Set as used by `internal/database` (e.g. `MONGODB_URI` or equivalent) |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth Web client ID; required to validate ID tokens for `loginGoogle` |
| `WALLETAPIKEY` | API key for external wallet/portfolio data (e.g. Covalent), if used by metrics logic |

Exact variable names depend on the implementation in `internal/database` and `internal/metrics`. Refer to the code and any existing `.env.example` if present.

## Schema Overview

- **Queries:** `profiles` (user profiles), `metrics(profile, window)` (risk metrics per profile and time window).
- **Mutations:** `createUser`, `login`, `loginGoogle` (Google ID token), `refreshToken`, `updateUserProfile`.
- **Types:** `ProfileResponse`, `ProfileMetrics` (contractAddress, contractName, logoURL, totalBalance, balanceVolatility, downsideVolatility, maxDrawdown, drawDownVolatility, giniCoefficientOfBalances).

The authoritative schema is in `graph/schema.graphqls`.

## Building and Running

```bash
# Install dependencies
go mod download

# Run the server (uses PORT from env or 8080)
go run .
```

With default port, the GraphQL Playground is at `http://localhost:8080/` and the API endpoint at `http://localhost:8080/query`.

## Authentication

- **Username/password:** Use `login(input: User!)` or `createUser`; the server returns a JWT. Send it in the `Authorization` header for protected operations.
- **Google:** Frontend sends the Google ID token to `loginGoogle(input: GoogleToken!)`. Backend validates the token with `GOOGLE_OAUTH_CLIENT_ID` and returns a JWT. Use the same JWT in `Authorization` for subsequent requests.

## Project Layout

- `graph/` – GraphQL schema, generated code, resolvers
- `internal/auth/` – JWT middleware
- `internal/database/` – MongoDB connection
- `internal/metrics/` – Metrics computation (e.g. volatility, drawdown)
- `internal/profile/` – Profile CRUD
- `internal/users/` – User CRUD and auth helpers
- `pckg/jwt/` – JWT issue/verify
- `server.go` – Entry point, Chi router, gqlgen handler

## Regenerating GraphQL Code

If you change `graph/schema.graphqls`:

```bash
go run github.com/99designs/gqlgen generate
```

Configuration is in `gqlgen.yml`.

## License

Proprietary. All rights reserved.
