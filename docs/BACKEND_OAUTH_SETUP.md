# Backend OAuth Setup Instructions

## Quick Start Guide

Follow these steps to set up and run the backend with Google OAuth support.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Google Cloud Console account (for OAuth credentials)
- npm or yarn package manager

## Step 1: Install Dependencies

```bash
cd /path/to/devcoll-api/social-network-microservices

# Install root dependencies
npm install

# Install google-auth-library (if not already installed)
npm install google-auth-library
```

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env` if not already done:
```bash
cp .env.example .env
```

2. Update the `.env` file with your Google OAuth credentials:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Database URLs (update if needed)
AUTH_DATABASE_URL="postgresql://postgres:password@localhost:5435/devcoll_auth?schema=public"

# JWT Configuration (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** or **People API**
4. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - User Type: External (for testing)
   - Add your app name, support email
   - Add scopes: `email`, `profile`, `openid`
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: Add your frontend URLs
     - `http://localhost:3000/api/auth/callback/google` (Next.js default)
     - `http://localhost:5173/api/auth/callback/google` (if using Vite)
7. Copy **Client ID** and **Client Secret** to your `.env`

## Step 3: Generate Proto TypeScript Files

```bash
# Generate TypeScript interfaces from proto files
npm run proto:gen
```

This will generate TypeScript files in the `generated/` directory with updated OAuth types.

## Step 4: Run Database Migrations

### Option A: Using npm script (recommended)

```bash
# Run migration for auth service
npm run prisma:migrate:auth
```

When prompted, enter migration name: `add_oauth_support`

### Option B: Manual migration

```bash
cd apps/auth-service

# Load env variables and run migration
export $(grep -v '^#' ../../.env | xargs) && npx prisma migrate dev --name add_oauth_support
```

### Verify Migration

Check that these fields were added to the `users` table:
- `firstName` (nullable)
- `lastName` (nullable)
- `profileImage` (nullable)
- `provider` (default: "local")
- `providerId` (nullable)

## Step 5: Generate Prisma Client

```bash
# Generate Prisma client with updated schema
npm run prisma:generate
```

Or manually:
```bash
cd apps/auth-service
npx prisma generate
```

## Step 6: Start the Services

### Start Database (Docker)

```bash
# Start PostgreSQL, MongoDB, Redis, RabbitMQ
docker-compose up -d
```

### Start Microservices

#### Development Mode (recommended)

```bash
# Terminal 1: Start Auth Service
npm run dev:auth

# Terminal 2: Start API Gateway
npm run dev:gateway

# Terminal 3 (optional): Start other services
npm run dev:user
npm run dev:post
npm run dev:media
npm run dev:search
```

#### Production Build

```bash
# Build all services
npm run build:all

# Start services
npm run start:auth
npm run start:gateway
```

## Step 7: Verify Setup

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T07:51:25.000Z"
}
```

### Test Google OAuth Endpoint

You'll need a valid Google ID token. Get one from your frontend or use Google OAuth Playground.

```bash
curl -X POST http://localhost:3000/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_GOOGLE_ID_TOKEN",
    "tokenType": "id_token"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "refreshExpiresIn": 604800,
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "username": "user",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": "https://...",
      "provider": "google",
      "isVerified": true
    }
  },
  "message": "Google authentication successful"
}
```

## Step 8: Frontend Integration

Update your frontend's `.env` to point to the backend:

```bash
# Frontend .env (Next.js)
API_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000

# Google OAuth (should match backend)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

The frontend is already configured to:
1. Authenticate users with Google
2. Exchange Google tokens for internal tokens
3. Use internal tokens for API requests

## Troubleshooting

### Issue: "GOOGLE_CLIENT_ID not configured"

**Solution:**
- Add `GOOGLE_CLIENT_ID` to `.env` file
- Restart the auth-service
- Verify environment variable is loaded: `echo $GOOGLE_CLIENT_ID`

### Issue: "Environment variable not found: AUTH_DATABASE_URL"

**Solution:**
```bash
# Export variables before running Prisma commands
export $(grep -v '^#' .env | xargs)

# Then run your command
cd apps/auth-service
npx prisma migrate dev
```

### Issue: "Port already in use"

**Solution:**
- Check if services are already running: `lsof -i :3000`
- Kill existing process: `kill -9 <PID>`
- Or change port in `.env`:
  ```bash
  API_GATEWAY_PORT=4000
  AUTH_SERVICE_PORT=50052
  ```

### Issue: "Cannot find module 'google-auth-library'"

**Solution:**
```bash
npm install google-auth-library
```

### Issue: "Database connection failed"

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Check connection string in `.env`:
   ```bash
   AUTH_DATABASE_URL="postgresql://postgres:password@localhost:5435/devcoll_auth?schema=public"
   ```

3. Test connection:
   ```bash
   psql -h localhost -p 5435 -U postgres -d devcoll_auth
   ```

### Issue: "Invalid Google token"

**Causes:**
- Token expired (Google ID tokens expire in 1 hour)
- Token not from correct Google Client ID
- Network issues with Google's servers

**Solution:**
- Get a fresh token from frontend
- Verify `GOOGLE_CLIENT_ID` matches frontend
- Check token format (should be JWT)

### Issue: Prisma Client errors after migration

**Solution:**
```bash
# Regenerate Prisma client
cd apps/auth-service
npx prisma generate

# Restart auth service
npm run dev:auth
```

## Service Ports

Default ports used by services:

| Service | Protocol | Port |
|---------|----------|------|
| API Gateway | HTTP | 3000 |
| Auth Service | gRPC | 50051 |
| User Service | gRPC | 50052 |
| Post Service | gRPC | 50053 |
| Media Service | gRPC | 50054 |
| Search Service | gRPC | 50055 |
| PostgreSQL (Auth) | TCP | 5435 |
| PostgreSQL (User) | TCP | 5433 |
| PostgreSQL (Post) | TCP | 5434 |
| MongoDB | TCP | 27017 |
| Redis | TCP | 6379 |
| RabbitMQ | TCP | 5672 |
| RabbitMQ Management | HTTP | 15672 |

## Development Workflow

### Making Schema Changes

1. Update Prisma schema:
   ```bash
   vim apps/auth-service/prisma/schema.prisma
   ```

2. Create migration:
   ```bash
   cd apps/auth-service
   export $(grep -v '^#' ../../.env | xargs)
   npx prisma migrate dev --name your_migration_name
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

### Making Proto Changes

1. Update proto file:
   ```bash
   vim proto/auth.proto
   ```

2. Generate TypeScript:
   ```bash
   npm run proto:gen
   ```

3. Restart services

### Viewing Database

```bash
# Open Prisma Studio for auth database
npm run prisma:studio:auth

# Or manually
cd apps/auth-service
npx prisma studio
```

Access at: http://localhost:5555

## Production Deployment

### Security Checklist

- [ ] Change all default secrets in `.env`
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database SSL
- [ ] Use environment-specific credentials
- [ ] Implement request logging
- [ ] Set up monitoring and alerts

### Environment Variables for Production

```bash
NODE_ENV=production
API_GATEWAY_PORT=3000
CORS_ORIGIN=https://yourdomain.com

# Use strong secrets
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>

# Database with SSL
AUTH_DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

# Google OAuth production credentials
GOOGLE_CLIENT_ID=prod-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=prod-secret
```

## Monitoring

### Check Service Health

```bash
# API Gateway health
curl http://localhost:3000/health

# Check logs
docker-compose logs -f auth-service
docker-compose logs -f api-gateway
```

### Database Monitoring

```bash
# Connect to PostgreSQL
docker exec -it <container-id> psql -U postgres -d devcoll_auth

# Check user count
SELECT COUNT(*) FROM users;

# Check OAuth users
SELECT provider, COUNT(*) FROM users GROUP BY provider;
```

## Additional Resources

- [Full OAuth Documentation](./GOOGLE_OAUTH_IMPLEMENTATION.md)
- [gRPC Error Handling](./GRPC_ERROR_HANDLING.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [API Gateway Documentation](../apps/api-gateway/README.md)

---

**Need Help?**
- Check logs: `docker-compose logs -f`
- Review documentation in `docs/` folder
- Open an issue on GitHub

**Last Updated:** October 30, 2025
