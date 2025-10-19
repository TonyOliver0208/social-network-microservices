# DevColl Social Network Microservices

A scalable social network backend built with **NestJS**, **gRPC**, **RabbitMQ**, **PostgreSQL**, **MongoDB**, and **Redis**.

## 🏗️ Architecture

### Services Overview

| Service | Port | Protocol | Database | Purpose |
|---------|------|----------|----------|---------|
| **API Gateway** | 3000 | HTTP/REST | - | Client entry point, routing |
| **Auth Service** | 50051 | gRPC + RabbitMQ | PostgreSQL | Authentication, JWT |
| **User Service** | 50052 | gRPC + RabbitMQ | PostgreSQL | User profiles, follows |
| **Post Service** | 50053 | gRPC + RabbitMQ | PostgreSQL | Posts, comments, likes |
| **Media Service** | 50054 | gRPC + RabbitMQ | MongoDB | File uploads, storage |
| **Search Service** | 50055 | gRPC + RabbitMQ | MongoDB/ES | Search indexing |

### Communication Patterns

1. **Client → API Gateway**: HTTP/REST (port 3000)
2. **API Gateway → Services**: gRPC (ports 50051-50055)
3. **Service ↔ Service**: RabbitMQ (async events)

**Flow Example:**
```
Client (HTTP POST /posts) 
  → API Gateway 
  → Post Service (gRPC: CreatePost) 
  → Publish POST_CREATED event
  → Search Service listens & indexes
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL, MongoDB, Redis, RabbitMQ (via Docker)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd social-network-microservices

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start infrastructure (PostgreSQL, MongoDB, Redis, RabbitMQ)
docker-compose up -d

# Run database migrations
npm run prisma:generate
npm run prisma:migrate
```

### Running Services

**Option 1: Development (separate terminals)**
```bash
npm run dev:gateway   # Terminal 1 - API Gateway :3000
npm run dev:auth      # Terminal 2 - Auth Service :50051
npm run dev:user      # Terminal 3 - User Service :50052
npm run dev:post      # Terminal 4 - Post Service :50053
npm run dev:media     # Terminal 5 - Media Service :50054
npm run dev:search    # Terminal 6 - Search Service :50055
```

**Option 2: Production Build**
```bash
npm run build:all
# Then run each service in production mode
```

## 📁 Project Structure

```
social-network-microservices/
├── apps/
│   ├── api-gateway/       # HTTP REST API
│   ├── auth-service/      # gRPC + Prisma
│   ├── user-service/      # gRPC + Prisma
│   ├── post-service/      # gRPC + Prisma
│   ├── media-service/     # gRPC + MongoDB
│   └── search-service/    # gRPC + MongoDB/Elasticsearch
├── libs/
│   └── common/           # Shared modules, DTOs, interfaces
├── proto/                # gRPC protocol definitions
│   ├── auth.proto
│   ├── user.proto
│   ├── post.proto
│   ├── media.proto
│   └── search.proto
├── docker-compose.yml    # Infrastructure services
├── ARCHITECTURE.md       # Detailed architecture docs
└── README.md            # This file
```

## 🛠️ Tech Stack

- **Framework**: NestJS
- **API Gateway**: Express (HTTP/REST)
- **Inter-service**: gRPC (Protocol Buffers)
- **Message Queue**: RabbitMQ (AMQP)
- **Databases**: PostgreSQL (Auth, User, Post), MongoDB (Media, Search)
- **Cache**: Redis
- **ORM**: Prisma (PostgreSQL), Mongoose (MongoDB)
- **Auth**: JWT (Access + Refresh tokens)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

## 📡 API Endpoints

**API Gateway** exposes REST endpoints at `http://localhost:3000/api/v1`

Documentation available at: `http://localhost:3000/api/docs`

### Example Endpoints
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
POST   /api/v1/posts
GET    /api/v1/posts/feed
POST   /api/v1/posts/:id/like
POST   /api/v1/media/upload
GET    /api/v1/search/users?q=john
GET    /api/v1/search/posts?q=nestjs
```

## 🔄 Event Flow Examples

### User Registration
```
1. Client → Gateway: POST /auth/register
2. Gateway → Auth Service (gRPC): Register()
3. Auth Service → RabbitMQ: Publish USER_REGISTERED
4. User Service: Listen USER_REGISTERED → Create profile
5. Search Service: Listen USER_REGISTERED → Index user
```

### Create Post
```
1. Client → Gateway: POST /posts
2. Gateway → Post Service (gRPC): CreatePost()
3. Post Service → RabbitMQ: Publish POST_CREATED
4. Search Service: Listen POST_CREATED → Index post
5. [Optional] Notification Service → Notify followers
```

## 📚 Documentation

- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Proto Files**: See `/proto` directory
- **API Reference**: Run gateway and visit `/api/docs`

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🐳 Docker

```bash
# Start all infrastructure
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild services
docker-compose up --build
```

## 🔐 Environment Variables

Key variables (see `.env.example`):

```env
# API Gateway
API_GATEWAY_PORT=3000

# gRPC Service URLs
AUTH_SERVICE_URL=localhost:50051
USER_SERVICE_URL=localhost:50052
POST_SERVICE_URL=localhost:50053
MEDIA_SERVICE_URL=localhost:50054
SEARCH_SERVICE_URL=localhost:50055

# Infrastructure
RABBITMQ_URL=amqp://guest:guest@localhost:5672
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
MONGODB_URI=mongodb://localhost:27017/dbname
```

## 📚 Documentation

- **[PROTO.md](./PROTO.md)** - Proto code generation guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed system architecture
- **[CHANGELOG.md](./CHANGELOG.md)** - Migration history and changes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team

DevColl Team

---

**Built with ❤️ using NestJS and gRPC**

