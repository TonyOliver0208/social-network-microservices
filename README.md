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

# gRPC Service Ports
AUTH_SERVICE_PORT=50051
USER_SERVICE_PORT=50052
POST_SERVICE_PORT=50053
MEDIA_SERVICE_PORT=50054
SEARCH_SERVICE_PORT=50055

# gRPC Service URLs (for Gateway)
AUTH_SERVICE_URL=localhost:50051
USER_SERVICE_URL=localhost:50052
POST_SERVICE_URL=localhost:50053
MEDIA_SERVICE_URL=localhost:50054
SEARCH_SERVICE_URL=localhost:50055
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

For detailed architecture and design decisions, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**  
For migration history and changes, see **[CHANGELOG.md](./CHANGELOG.md)**

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Gateway
API_GATEWAY_PORT=3000

# gRPC Service Ports
AUTH_SERVICE_PORT=50051
USER_SERVICE_PORT=50052
POST_SERVICE_PORT=50053
MEDIA_SERVICE_PORT=50054
SEARCH_SERVICE_PORT=50055

# gRPC Service URLs (for Gateway)
AUTH_SERVICE_URL=localhost:50051
USER_SERVICE_URL=localhost:50052
POST_SERVICE_URL=localhost:50053
MEDIA_SERVICE_URL=localhost:50054
SEARCH_SERVICE_URL=localhost:50055

# Database URLs
AUTH_DATABASE_URL="postgresql://postgres:password@localhost:5435/devcoll_auth?schema=public"
USER_DATABASE_URL="postgresql://postgres:password@localhost:5433/devcoll_user?schema=public"
POST_DATABASE_URL="postgresql://postgres:password@localhost:5434/devcoll_post?schema=public"
MEDIA_MONGODB_URI="mongodb://localhost:27017/devcoll_media"
SEARCH_MONGODB_URI="mongodb://localhost:27017/devcoll_search"

# Infrastructure
RABBITMQ_URL=amqp://guest:guest@localhost:5672
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### Docker vs Local Development

**Local Development:**
- Services: `localhost:50051-50055`
- Databases: `localhost:5433-5435` (PostgreSQL), `localhost:27017` (MongoDB)

**Docker:**
- Services: `service-name:50051-50055` (e.g., `auth-service:50051`)
- Databases: Internal Docker network names

---

## 🔧 Proto Code Generation

TypeScript interfaces are auto-generated from `.proto` files for type-safe gRPC communication.

### Generate Proto Code

```bash
# After modifying any .proto file in proto/
npm run proto:gen
```

### Proto Files Location

```
proto/
  ├── auth.proto      # Authentication service
  ├── user.proto      # User service
  ├── post.proto      # Post service  
  ├── media.proto     # Media service
  └── search.proto    # Search service
```

### Generated Code

```
generated/           # Auto-generated TypeScript (DO NOT EDIT)
  ├── auth.ts
  ├── user.ts
  ├── post.ts
  ├── media.ts
  └── search.ts
```

### Usage Example

```typescript
import { AUTHSERVICE_SERVICE_NAME } from 'generated/auth';

@GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'Login')
async login(dto: LoginDto) {
  // Implementation
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

---

**Built with ❤️ using NestJS and gRPC**

