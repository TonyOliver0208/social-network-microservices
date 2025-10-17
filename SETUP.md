# 🚀 DevColl Microservices - Setup & Installation Guide

## Overview

This guide will help you set up the complete DevColl Social Network Microservices project with NestJS, Prisma, PostgreSQL, MongoDB, Redis, and RabbitMQ.

## 📁 Project Structure

```
social-network-microservices/
├── apps/
│   ├── api-gateway/          # HTTP Gateway (Port 3000)
│   ├── auth-service/         # Authentication (Port 3001, PostgreSQL)
│   ├── user-service/         # User Management (Port 3002, PostgreSQL)
│   ├── post-service/         # Posts & Feed (Port 3003, PostgreSQL)
│   ├── media-service/        # Media Upload (Port 3004, MongoDB)
│   └── search-service/       # Search Engine (Port 3005, MongoDB)
├── libs/
│   └── common/               # Shared library
├── docker-compose.yml        # Docker orchestration
├── .env.example              # Environment template
└── README.md
```

## 🔧 Prerequisites

Before starting, ensure you have:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))
- **Cloudinary Account** (free tier: [Sign up](https://cloudinary.com/))

## 📥 Step 1: Clone & Setup

```bash
# Clone the repository
git clone <repository-url>
cd social-network-microservices

# Copy environment file
cp .env.example .env
```

## ⚙️ Step 2: Configure Environment Variables

Edit the `.env` file with your settings:

### Required Configuration

```bash
# Database URLs
AUTH_DATABASE_URL="postgresql://postgres:password@localhost:5432/devcoll_auth?schema=public"
USER_DATABASE_URL="postgresql://postgres:password@localhost:5433/devcoll_user?schema=public"
POST_DATABASE_URL="postgresql://postgres:password@localhost:5434/devcoll_post?schema=public"
MEDIA_MONGODB_URI="mongodb://localhost:27017/devcoll_media"
SEARCH_MONGODB_URI="mongodb://localhost:27017/devcoll_search"

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Cloudinary (Get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL="amqp://guest:guest@localhost:5672"

# CORS
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```

## 🐳 Step 3: Start Infrastructure (Docker)

Start PostgreSQL, MongoDB, Redis, and RabbitMQ:

```bash
docker-compose up -d postgres-auth postgres-user postgres-post mongodb redis rabbitmq
```

Verify services are running:

```bash
docker-compose ps
```

Expected output:
```
NAME                    STATUS          PORTS
devcoll-postgres-auth   Up             0.0.0.0:5432->5432/tcp
devcoll-postgres-user   Up             0.0.0.0:5433->5432/tcp
devcoll-postgres-post   Up             0.0.0.0:5434->5432/tcp
devcoll-mongodb         Up             0.0.0.0:27017->27017/tcp
devcoll-redis           Up             0.0.0.0:6379->6379/tcp
devcoll-rabbitmq        Up             0.0.0.0:5672,15672->5672,15672/tcp
```

## 📦 Step 4: Install Dependencies

Install dependencies for all services:

```bash
# Install root dependencies
npm install

# Install common library
cd libs/common && npm install && cd ../..

# Install API Gateway
cd apps/api-gateway && npm install && cd ../..

# Install Auth Service
cd apps/auth-service && npm install && cd ../..

# Install User Service (repeat for other services)
cd apps/user-service && npm install && cd ../..
cd apps/post-service && npm install && cd ../..
cd apps/media-service && npm install && cd ../..
cd apps/search-service && npm install && cd ../..
```

Or use the convenience script:

```bash
npm run install:all
```

## 🗄️ Step 5: Setup Databases

### Generate Prisma Clients

```bash
# Generate Prisma clients for all PostgreSQL services
cd apps/auth-service && npx prisma generate && cd ../..
cd apps/user-service && npx prisma generate && cd ../..
cd apps/post-service && npx prisma generate && cd ../..
```

Or use:

```bash
npm run prisma:generate
```

### Run Database Migrations

```bash
# Run migrations for Auth Service
cd apps/auth-service && npx prisma migrate dev --name init && cd ../..

# Run migrations for User Service
cd apps/user-service && npx prisma migrate dev --name init && cd ../..

# Run migrations for Post Service
cd apps/post-service && npx prisma migrate dev --name init && cd ../..
```

Or use:

```bash
npm run prisma:migrate
```

## 🚀 Step 6: Start Microservices

### Option A: Manual (Recommended for Development)

Open **6 separate terminals** and run:

**Terminal 1 - API Gateway:**
```bash
cd apps/api-gateway
npm run start:dev
```

**Terminal 2 - Auth Service:**
```bash
cd apps/auth-service
npm run start:dev
```

**Terminal 3 - User Service:**
```bash
cd apps/user-service
npm run start:dev
```

**Terminal 4 - Post Service:**
```bash
cd apps/post-service
npm run start:dev
```

**Terminal 5 - Media Service:**
```bash
cd apps/media-service
npm run start:dev
```

**Terminal 6 - Search Service:**
```bash
cd apps/search-service
npm run start:dev
```

### Option B: Using Concurrently (All at once)

Install concurrently:

```bash
npm install -g concurrently
```

Add to root `package.json`:

```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev:gateway\" \"npm run dev:auth\" \"npm run dev:user\" \"npm run dev:post\" \"npm run dev:media\" \"npm run dev:search\""
  }
}
```

Then run:

```bash
npm run dev:all
```

### Option C: Using PM2 (Production-like)

Install PM2:

```bash
npm install -g pm2
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'api-gateway',
      cwd: './apps/api-gateway',
      script: 'npm',
      args: 'run start:dev',
    },
    {
      name: 'auth-service',
      cwd: './apps/auth-service',
      script: 'npm',
      args: 'run start:dev',
    },
    {
      name: 'user-service',
      cwd: './apps/user-service',
      script: 'npm',
      args: 'run start:dev',
    },
    {
      name: 'post-service',
      cwd: './apps/post-service',
      script: 'npm',
      args: 'run start:dev',
    },
    {
      name: 'media-service',
      cwd: './apps/media-service',
      script: 'npm',
      args: 'run start:dev',
    },
    {
      name: 'search-service',
      cwd: './apps/search-service',
      script: 'npm',
      args: 'run start:dev',
    },
  ],
};
```

Start all services:

```bash
pm2 start ecosystem.config.js
pm2 logs
```

## ✅ Step 7: Verify Installation

### Check Service Health

**API Gateway:**
```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "API Gateway is healthy",
  "timestamp": "2025-10-14T10:00:00.000Z",
  "uptime": 123.45
}
```

### Access Swagger Documentation

Open in browser:
```
http://localhost:3000/api/docs
```

### Test Registration & Login

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test1234!"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

## 🔍 Step 8: Development Tools

### Prisma Studio (Database GUI)

View and edit database data:

```bash
# Auth Service (Port 5555)
cd apps/auth-service && npx prisma studio

# User Service (Port 5556)
cd apps/user-service && npx prisma studio --port 5556

# Post Service (Port 5557)
cd apps/post-service && npx prisma studio --port 5557
```

### RabbitMQ Management Console

Access at: http://localhost:15672
- Username: `guest`
- Password: `guest`

### MongoDB Compass

Connect to: `mongodb://localhost:27017`

## 🐛 Troubleshooting

### Issue: Database Connection Failed

**Solution:**
```bash
# Check if databases are running
docker-compose ps

# Restart databases
docker-compose restart postgres-auth postgres-user postgres-post mongodb

# Check logs
docker-compose logs postgres-auth
```

### Issue: Port Already in Use

**Solution:**
```bash
# Find process using port (e.g., 3000)
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
API_GATEWAY_PORT=3001
```

### Issue: Prisma Client Not Generated

**Solution:**
```bash
cd apps/auth-service
npx prisma generate
cd ../..
```

### Issue: RabbitMQ Connection Failed

**Solution:**
```bash
# Restart RabbitMQ
docker-compose restart rabbitmq

# Wait for health check
docker-compose logs -f rabbitmq
```

### Issue: Module Not Found

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules libs/*/node_modules
npm run install:all
```

## 📊 Database Seeding (Optional)

Create seed data for testing:

```bash
# Auth Service seed
cd apps/auth-service
npx prisma db seed

# User Service seed
cd apps/user-service
npx prisma db seed
```

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (min 32 characters)
- [ ] Set up environment-specific `.env` files
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable database connection pooling
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure log aggregation (ELK Stack)
- [ ] Set up backup strategy

## 🚢 Docker Deployment

Build and run all services with Docker:

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Clean up (including volumes)
docker-compose down -v
```

## 📈 Performance Tips

1. **Enable Redis caching** for frequently accessed data
2. **Use connection pooling** for databases
3. **Implement pagination** for list endpoints
4. **Add database indexes** on frequently queried fields
5. **Use CDN** for media files (Cloudinary)
6. **Enable gzip compression** on API Gateway
7. **Implement rate limiting** per user/IP
8. **Use horizontal scaling** for high traffic

## 📚 Next Steps

1. ✅ Complete the remaining services (User, Post, Media, Search)
2. ✅ Implement frontend client (React/Vue/Angular)
3. ✅ Add real-time features (WebSocket/Socket.io)
4. ✅ Implement notification service
5. ✅ Add email service (SendGrid/SES)
6. ✅ Set up CI/CD pipeline (GitHub Actions)
7. ✅ Add monitoring & alerting
8. ✅ Implement analytics

## 🤝 Need Help?

- 📖 [NestJS Documentation](https://docs.nestjs.com/)
- 📖 [Prisma Documentation](https://www.prisma.io/docs)
- 📖 [Docker Documentation](https://docs.docker.com/)
- 💬 Open an issue on GitHub
- 💬 Join our Discord community

---

**Happy Coding! 🚀**
