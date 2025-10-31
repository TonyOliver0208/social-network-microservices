# 🔧 Prisma Configuration Fixed

## Issues Resolved

### 1. ✅ Post-Service Prisma Schema
**Problem**: Schema was using generic `DATABASE_URL` instead of `POST_DATABASE_URL`
**Fixed**: Updated to use `POST_DATABASE_URL` from `.env` file

### 2. ✅ Prisma Client Output Paths
**Problem**: Inconsistent output paths across services
**Fixed**: Standardized all services to use `../../../node_modules/.prisma/client-{service}`

### 3. ✅ User-Service Prisma Schema
**Problem**: Missing output configuration
**Fixed**: Added proper output path for Prisma client

### 4. ✅ Migration Scripts
**Problem**: `npm run prisma:migrate:*` commands didn't load environment variables
**Fixed**: Updated package.json scripts to export environment variables before running migrations

---

## Changes Made

### File: `apps/post-service/prisma/schema.prisma`
```diff
datasource db {
  provider = "postgresql"
-  url      = env("DATABASE_URL")
+  url      = env("POST_DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
-  output   = "../node_modules/.prisma/client-post"
+  output   = "../../../node_modules/.prisma/client-post"
}
```

### File: `apps/user-service/prisma/schema.prisma`
```diff
generator client {
  provider = "prisma-client-js"
+  output   = "../../../node_modules/.prisma/client-user"
}
```

### File: `package.json`
```diff
-"prisma:migrate:auth": "cd apps/auth-service && npx prisma migrate dev",
-"prisma:migrate:user": "cd apps/user-service && npx prisma migrate dev",
-"prisma:migrate:post": "cd apps/post-service && npx prisma migrate dev",
+"prisma:migrate:auth": "export $(cat .env | grep -v '^#' | xargs) && cd apps/auth-service && npx prisma migrate dev",
+"prisma:migrate:user": "export $(cat .env | grep -v '^#' | xargs) && cd apps/user-service && npx prisma migrate dev",
+"prisma:migrate:post": "export $(cat .env | grep -v '^#' | xargs) && cd apps/post-service && npx prisma migrate dev",
```

---

## Prisma Database Configuration

### Environment Variables (`.env`)
```env
AUTH_DATABASE_URL="postgresql://postgres:password@localhost:5435/devcoll_auth?schema=public"
USER_DATABASE_URL="postgresql://postgres:password@localhost:5433/devcoll_user?schema=public"
POST_DATABASE_URL="postgresql://postgres:password@localhost:5434/devcoll_post?schema=public"
```

### Database Ports
| Service | Port | Database |
|---------|------|----------|
| Auth | 5435 | devcoll_auth |
| User | 5433 | devcoll_user |
| Post | 5434 | devcoll_post |

---

## How to Run Migrations

### All Services at Once
```bash
npm run prisma:migrate
```

This will run migrations for all three services (auth, user, post).

### Individual Services
```bash
# Auth service
npm run prisma:migrate:auth

# User service
npm run prisma:migrate:user

# Post service
npm run prisma:migrate:post
```

### Generate Prisma Client Only
If you just need to regenerate the Prisma client without running migrations:
```bash
npm run prisma:generate
```

---

## Migration Status

✅ **Auth Service**: Already migrated (no changes needed)
✅ **Post Service**: Migration `20251031043532_init` applied successfully
✅ **User Service**: Migration `20251031043628_init` applied successfully

---

## Starting the Services

### Prerequisites
Make sure Docker containers are running:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (3 instances for auth, user, post)
- MongoDB (for media and search services)
- Redis (for caching)
- RabbitMQ (for message queue)

### Start API Gateway (Port 4000)
```bash
npm run dev:gateway
```

### Start Individual Microservices
```bash
# Auth service (gRPC port 50051)
npm run dev:auth

# User service (gRPC port 50052)
npm run dev:user

# Post service (gRPC port 50053)
npm run dev:post

# Media service (gRPC port 50054)
npm run dev:media

# Search service (gRPC port 50055)
npm run dev:search
```

---

## Prisma Studio (Database GUI)

To view and manage database data:

```bash
# Auth database
npm run prisma:studio:auth

# User database
npm run prisma:studio:user

# Post database
npm run prisma:studio:post
```

Prisma Studio will open in your browser at http://localhost:5555

---

## Troubleshooting

### Error: "Cannot find module '.prisma/client-*'"

**Solution**: Run Prisma generate
```bash
npm run prisma:generate
```

### Error: "Environment variable not found: *_DATABASE_URL"

**Solution**: Make sure `.env` file exists in the root directory with correct database URLs

### Error: "Can't reach database server"

**Solution**: Make sure Docker containers are running
```bash
docker-compose up -d
docker ps  # Verify containers are running
```

### Error: "Connection to transport failed" (RabbitMQ)

**Cause**: RabbitMQ container is starting up or not running

**Solution**: 
1. Check if RabbitMQ is running: `docker ps | grep rabbit`
2. Wait for RabbitMQ to be healthy (check: starting → healthy)
3. Restart the service after RabbitMQ is ready

### Migration fails with permission error

**Solution**: Make sure PostgreSQL containers are healthy
```bash
docker ps  # Check status shows (healthy)
```

---

## Complete Startup Sequence

For a fresh start, follow this order:

### 1. Start Docker Services
```bash
cd devcoll-api/social-network-microservices
docker-compose up -d
```

### 2. Wait for Services to be Ready
```bash
# Wait ~30 seconds for all containers to be healthy
docker ps  # Check all show (healthy)
```

### 3. Run Migrations (First Time Only)
```bash
npm run prisma:migrate
```

### 4. Generate Prisma Clients
```bash
npm run prisma:generate
```

### 5. Start API Gateway
```bash
npm run dev:gateway
```

### 6. Start Required Microservices
In separate terminals:
```bash
# Terminal 1: Auth
npm run dev:auth

# Terminal 2: User  
npm run dev:user

# Terminal 3: Post
npm run dev:post
```

### 7. Start Frontend
```bash
cd ../devcoll-client
npm run dev
```

---

## Service Architecture

```
Frontend (Port 3001)
    ↓ HTTP/REST
API Gateway (Port 4000)
    ↓ gRPC
┌─────────────────────────────────────┐
│  Auth Service (50051) → PostgreSQL  │
│  User Service (50052) → PostgreSQL  │
│  Post Service (50053) → PostgreSQL  │
│  Media Service (50054) → MongoDB    │
│  Search Service (50055) → MongoDB   │
└─────────────────────────────────────┘
          ↓          ↓
     Redis (6379)  RabbitMQ (5672)
```

---

## Useful Commands

```bash
# Check all running containers
docker ps

# View container logs
docker-compose logs -f [service-name]

# Restart a specific container
docker-compose restart [service-name]

# Stop all containers
docker-compose down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose down -v

# Check Prisma client generation
ls -la node_modules/.prisma/

# View migration history
cd apps/post-service && npx prisma migrate status
```

---

## Next Steps

1. ✅ Migrations completed
2. ✅ Prisma clients generated
3. ⏳ Start all Docker services
4. ⏳ Start API Gateway on port 4000
5. ⏳ Start microservices
6. ⏳ Test API endpoints
7. ⏳ Start frontend and test integration

---

**Status**: ✅ Prisma configuration fixed and migrations completed

**Ready to**: Start the services and test the application

**Last Updated**: October 31, 2025
