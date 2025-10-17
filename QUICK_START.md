# 🚀 Quick Start - DevColl Microservices

## ⚡ 5-Minute Setup

### 1. Prerequisites Check
```bash
node --version    # Should be v18+
docker --version  # Should be installed
npm --version     # Should be v9+
```

### 2. Clone & Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit .env and set:
# - JWT_SECRET (min 32 characters)
# - JWT_REFRESH_SECRET (min 32 characters)
# - CLOUDINARY_* credentials
```

### 3. Start Infrastructure (1 minute)
```bash
docker-compose up -d postgres-auth postgres-user postgres-post mongodb redis rabbitmq

# Wait for health checks
docker-compose ps
```

### 4. Install Dependencies (2 minutes)
```bash
npm install
cd libs/common && npm install && cd ../..
cd apps/api-gateway && npm install && cd ../..
cd apps/auth-service && npm install && cd ../..
cd apps/user-service && npm install && cd ../..
```

### 5. Setup Auth Service (1 minute)
```bash
cd apps/auth-service
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

### 6. Setup User Service (1 minute)
```bash
cd apps/user-service
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

### 7. Start Services
```bash
# Terminal 1
cd apps/api-gateway && npm run start:dev

# Terminal 2
cd apps/auth-service && npm run start:dev

# Terminal 3
cd apps/user-service && npm run start:dev
```

---

## 🧪 Test the API

### 1. Health Check
```bash
curl http://localhost:3000/api/v1/health
```

### 2. Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "password": "Test1234!"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test1234!"
  }'
```

### 4. View Swagger Docs
Open: http://localhost:3000/api/docs

---

## 📊 Service Status

Check if all services are running:

```bash
# Check ports
lsof -i :3000  # API Gateway
lsof -i :3001  # Auth Service
lsof -i :3002  # User Service
lsof -i :5432  # PostgreSQL Auth
lsof -i :5433  # PostgreSQL User
lsof -i :27017 # MongoDB
lsof -i :6379  # Redis
lsof -i :5672  # RabbitMQ
```

---

## 🔍 Management UIs

- **Swagger API Docs**: http://localhost:3000/api/docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **Prisma Studio (Auth)**: `cd apps/auth-service && npx prisma studio`
- **Prisma Studio (User)**: `cd apps/user-service && npx prisma studio --port 5556`

---

## 🐛 Common Issues

### Issue: Port already in use
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

### Issue: Database connection failed
```bash
# Restart databases
docker-compose restart postgres-auth postgres-user mongodb

# Check logs
docker-compose logs postgres-auth
```

### Issue: Prisma client not found
```bash
cd apps/auth-service
npx prisma generate
cd ../..
```

### Issue: Module not found
```bash
# Reinstall dependencies
rm -rf node_modules apps/*/node_modules libs/*/node_modules
npm install
cd libs/common && npm install && cd ../..
cd apps/api-gateway && npm install && cd ../..
cd apps/auth-service && npm install && cd ../..
```

---

## 📦 What's Included

✅ **API Gateway** - HTTP entry point  
✅ **Auth Service** - JWT authentication  
✅ **User Service** - Profiles & follows  
✅ **Common Library** - Shared utilities  
✅ **Docker Compose** - Infrastructure  
✅ **Prisma** - Type-safe ORM  
✅ **Swagger** - API documentation  
✅ **Redis** - Caching  
✅ **RabbitMQ** - Event streaming  

---

## 📝 What to Implement Next

1. **Post Service** - Posts, comments, likes, feed
2. **Media Service** - Image/video uploads (Cloudinary)
3. **Search Service** - Full-text search (MongoDB)
4. **Notification Service** - Real-time notifications
5. **Email Service** - Email sending (SendGrid)

---

## 🎯 Project Structure

```
apps/
├── api-gateway/        ✅ DONE - HTTP Gateway
├── auth-service/       ✅ DONE - Authentication
├── user-service/       ✅ DONE - User management
├── post-service/       ⏳ TODO
├── media-service/      ⏳ TODO
└── search-service/     ⏳ TODO

libs/
└── common/             ✅ DONE - Shared library
```

---

## 🔗 Useful Commands

```bash
# Start all infrastructure
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart auth-service

# Generate Prisma client
cd apps/auth-service && npx prisma generate

# Run migrations
cd apps/auth-service && npx prisma migrate dev

# View database in UI
cd apps/auth-service && npx prisma studio

# Build for production
npm run build:all

# Install all dependencies
npm run install:all
```

---

## 📚 Documentation

- **README.md** - Project overview
- **SETUP.md** - Complete setup guide
- **DEVELOPMENT.md** - Development guide
- **PROJECT_SUMMARY.md** - What's been created
- **This file** - Quick reference

---

## 💡 Tips

1. Use **Swagger** at http://localhost:3000/api/docs for API testing
2. Check **RabbitMQ** at http://localhost:15672 for message queues
3. Use **Prisma Studio** for database GUI
4. All services have hot-reload enabled (watch mode)
5. Redis cache has 5-minute default TTL

---

## 🎉 Success Checklist

- [ ] All Docker containers running
- [ ] API Gateway responds at port 3000
- [ ] Auth Service responds at port 3001
- [ ] User Service responds at port 3002
- [ ] Can register a new user
- [ ] Can login and get JWT token
- [ ] Swagger docs accessible
- [ ] RabbitMQ management UI accessible
- [ ] Prisma Studio works

---

## 🆘 Need Help?

1. Check the logs: `docker-compose logs -f [service-name]`
2. Review SETUP.md for detailed instructions
3. Check DEVELOPMENT.md for patterns and best practices
4. Review PROJECT_SUMMARY.md for what's implemented

---

**Happy Coding! 🚀**

For complete documentation, see:
- README.md
- SETUP.md  
- DEVELOPMENT.md
- PROJECT_SUMMARY.md
