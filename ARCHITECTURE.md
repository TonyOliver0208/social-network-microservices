# Microservices Architecture - Production Implementation

## 🏗️ Architecture Overview

### Core Principles

✅ **API Gateway Pattern**: Single entry point for all client requests  
✅ **gRPC for Service Communication**: High-performance synchronous RPC  
✅ **Message Queue for Events**: Async event-driven architecture with RabbitMQ  
✅ **Database per Service**: Each service owns its data store  
✅ **Polyglot Persistence**: PostgreSQL for relational, MongoDB for documents  

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│                    (Web/Mobile App)                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                      API GATEWAY                              │
│                    (NestJS - Port 3000)                       │
│                                                               │
│  • JWT Token Validation                                       │
│  • Request Routing                                            │
│  • Rate Limiting                                              │
│  • Swagger Documentation                                      │
└──────────┬──────────────┬──────────────┬─────────────────────┘
           │              │              │
         gRPC           gRPC           gRPC
           │              │              │
   ┌───────┘              │              └───────┐
   ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  AUTH SERVICE    │  │  USER SERVICE    │  │  POST SERVICE    │
│   gRPC: 50051    │  │   gRPC: 50052    │  │   gRPC: 50053    │
│  + RabbitMQ      │  │  + RabbitMQ      │  │  + RabbitMQ      │
│  PostgreSQL      │  │  PostgreSQL      │  │  PostgreSQL      │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                               │
                         RabbitMQ Broker
                    (Async Event Distribution)
                               │
         ┌─────────────────────┴─────────────────────┐
         │                                            │
       gRPC                                         gRPC
         │                                            │
         ▼                                            ▼
┌──────────────────┐                          ┌──────────────────┐
│  MEDIA SERVICE   │                          │ SEARCH SERVICE   │
│   gRPC: 50054    │                          │   gRPC: 50055    │
│  + RabbitMQ      │                          │  + RabbitMQ      │
│   MongoDB        │                          │  Elasticsearch   │
└──────────────────┘                          └──────────────────┘
```

---

## 🔄 Communication Patterns

### 1. **Client ↔ API Gateway** (HTTP/REST)
- REST endpoints for external clients
- JWT authentication
- Request validation
- Response formatting

### 2. **API Gateway ↔ Services** (gRPC)
- **Protocol**: gRPC (HTTP/2)
- **Why**: Type-safe, fast, efficient serialization
- **Pattern**: Synchronous request-response
- **Examples**: 
  - `gateway.getUser() → user-service.GetUserById()`
  - `gateway.createPost() → post-service.CreatePost()`

### 3. **Service ↔ Service** (RabbitMQ)
- **Protocol**: AMQP via RabbitMQ
- **Why**: Decoupled, async, resilient
- **Pattern**: Event-driven pub/sub
- **Examples**:
  - `post-service` publishes `POST_CREATED` → `search-service` indexes
  - `user-service` publishes `USER_UPDATED` → `search-service` re-indexes

---

## 🎯 Service Responsibilities

### 1. API Gateway (`apps/api-gateway`)
**Port:** 3000 (HTTP)

**Responsibilities:**
- Accept HTTP requests from clients
- Validate JWT tokens
- Route to appropriate service via gRPC
- Aggregate responses if needed
- Handle CORS, rate limiting
- Serve Swagger documentation

**Does NOT contain business logic**

---

### 2. Auth Service (`apps/auth-service`)
**gRPC Port:** 50051  
**RabbitMQ Queue:** `auth_queue`  
**Database:** PostgreSQL (`devcoll_auth`)

**gRPC Methods:**
- `Register()`
- `Login()`
- `ValidateToken()`
- `RefreshToken()`
- `Logout()`
- `ResetPassword()`

**Events Published:**
- `USER_REGISTERED`
- `USER_LOGGED_IN`
- `PASSWORD_RESET`

---

### 3. User Service (`apps/user-service`)
**gRPC Port:** 50052  
**RabbitMQ Queue:** `user_queue`  
**Database:** PostgreSQL (`devcoll_user`)

**gRPC Methods:**
- `GetUserById()`
- `GetUserByEmail()`
- `UpdateProfile()`
- `FollowUser()`
- `UnfollowUser()`
- `GetFollowers()`
- `GetFollowing()`

**Events Published:**
- `USER_UPDATED`
- `USER_DELETED`
- `USER_FOLLOWED`
- `USER_UNFOLLOWED`

**Events Consumed:**
- `USER_REGISTERED` (from auth-service)

---

### 4. Post Service (`apps/post-service`)
**gRPC Port:** 50053  
**RabbitMQ Queue:** `post_queue`  
**Database:** PostgreSQL (`devcoll_post`)

**gRPC Methods:**
- `CreatePost()`
- `GetPostById()`
- `UpdatePost()`
- `DeletePost()`
- `GetUserPosts()`
- `GetFeed()`
- `LikePost()`
- `UnlikePost()`
- `CreateComment()`
- `GetComments()`
- `DeleteComment()`

**Events Published:**
- `POST_CREATED`
- `POST_UPDATED`
- `POST_DELETED`
- `POST_LIKED`
- `COMMENT_CREATED`

**Events Consumed:**
- `USER_DELETED` (cleanup user posts)

---

### 5. Media Service (`apps/media-service`)
**gRPC Port:** 50054  
**RabbitMQ Queue:** `media_queue`  
**Database:** MongoDB (`devcoll_media`)

**gRPC Methods:**
- `UploadMedia()`
- `GetMedia()`
- `DeleteMedia()`
- `GetUserMedia()`

**Events Published:**
- `MEDIA_UPLOADED`
- `MEDIA_DELETED`

**Events Consumed:**
- `USER_DELETED` (cleanup user media)
- `POST_DELETED` (cleanup post media)

---

### 6. Search Service (`apps/search-service`)
**gRPC Port:** 50055  
**RabbitMQ Queue:** `search_queue`  
**Database:** Elasticsearch

**gRPC Methods:**
- `SearchUsers()`
- `SearchPosts()`
- `SearchAll()`
- `IndexUser()`
- `IndexPost()`
- `RemoveUserIndex()`
- `RemovePostIndex()`

**Events Consumed:**
- `USER_CREATED` → Index user
- `USER_UPDATED` → Update index
- `USER_DELETED` → Remove index
- `POST_CREATED` → Index post
- `POST_UPDATED` → Update index
- `POST_DELETED` → Remove index

---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | NestJS |
| API Gateway | HTTP/REST |
| Inter-service | gRPC |
| Event Bus | RabbitMQ |
| Auth Storage | PostgreSQL |
| User Storage | PostgreSQL |
| Post Storage | PostgreSQL |
| Media Storage | MongoDB |
| Search Engine | Elasticsearch (MongoDB for now) |
| Cache | Redis |
| Container | Docker |

---

## 📦 Proto Files

All gRPC service contracts are defined in `/proto`:
- `auth.proto` - Authentication service
- `user.proto` - User service
- `post.proto` - Post service
- `media.proto` - Media service
- `search.proto` - Search service

---

## 🚀 Running the System

```bash
# Start infrastructure
docker-compose up -d

# Install dependencies
npm install

# Run migrations
npm run prisma:migrate

# Start services (separate terminals)
npm run dev:gateway  # HTTP :3000
npm run dev:auth     # gRPC :50051
npm run dev:user     # gRPC :50052
npm run dev:post     # gRPC :50053
npm run dev:media    # gRPC :50054
npm run dev:search   # gRPC :50055
```

---

## 🔐 Environment Variables

Each service requires:
- Database connection strings
- RabbitMQ URL
- Redis URL
- Service URLs (for gateway)
- JWT secrets (for auth)

See individual service `.env.example` files.

---

## ✅ Why This Architecture?

1. **gRPC for sync calls**: 
   - Fast binary protocol
   - Type-safe contracts
   - Auto-generated clients
   - HTTP/2 multiplexing

2. **RabbitMQ for async events**:
   - Decoupled services
   - Resilient to failures
   - Easy to add new consumers
   - Built-in retry mechanisms

3. **API Gateway**:
   - Single entry point
   - Centralized auth
   - Client doesn't know about services
   - Easy to add caching/throttling

4. **Database per service**:
   - Independent scaling
   - Technology freedom
   - Failure isolation
   - Clear ownership

**Communication:**
- Receives HTTP requests from clients
- Makes HTTP calls to backend services
- Does NOT use RabbitMQ for request-response

**What it DOES:**
- ✅ Accept HTTP/REST requests from clients
- ✅ Validate JWT tokens (authentication only)
- ✅ Forward requests to services via **HTTP/REST calls**
- ✅ Aggregate responses from multiple services
- ✅ Handle CORS, rate limiting, compression
- ✅ Serve Swagger documentation

**What it DOES NOT do:**
- ❌ Business logic (validation, authorization, data processing)
- ❌ Direct database access
- ❌ File processing (beyond initial upload reception)
- ❌ Authorization decisions ("can user X do Y?")
- ❌ Use RabbitMQ for synchronous requests

**Example Flow (HTTP):**
```typescript
// Gateway receives HTTP request from client
POST /api/v1/posts
Headers: { Authorization: "Bearer <JWT>" }
Body: { content: "Hello World" }

// Gateway Controller (HTTP client):
@Post()
@UseGuards(JwtAuthGuard)
async createPost(@CurrentUser('userId') userId: string, @Body() dto: CreatePostDto) {
  // 1. Validate JWT → extract userId (done by guard)
  
  // 2. Call Post Service via HTTP
  const response = await this.httpService.post(
    'http://post-service:3003/posts',
    dto,
    { headers: { 'x-user-id': userId } }
  );
  
  // 3. Return response to client
  return response.data;
}
```

---

### 2. Auth Service (`apps/auth-service`)
**Port:** 3001  
**Database:** PostgreSQL (`devcoll_auth`)

**Communication:**
- Exposes HTTP REST API for synchronous requests
- Emits RabbitMQ events for async side effects

**Responsibilities:**
- User registration with password hashing
- User login with JWT generation
- Token refresh logic
- Password reset flows
- JWT validation for other services

**HTTP Endpoints (Synchronous):**
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate user session
- `POST /auth/validate` - Validate JWT for other services

**RabbitMQ Events Emitted (Asynchronous):**
- `USER_REGISTERED` → Triggers user profile creation in User Service
- `USER_LOGGED_IN` → Track user activity
- `PASSWORD_RESET` → Send notification

**Example:**
```typescript
// HTTP endpoint in Auth Service
@Post('/register')
async register(@Body() dto: RegisterDto) {
  // 1. Create user in database
  const user = await this.authService.register(dto);
  
  // 2. Emit async event (fire and forget)
  this.rabbitClient.emit(EVENTS.USER_REGISTERED, {
    userId: user.id,
    email: user.email,
    username: user.username,
  });
  
  // 3. Return immediately
  return { success: true, tokens: user.tokens };
}
```

---

### 3. User Service (`apps/user-service`)
**Port:** 3002  
**Database:** PostgreSQL (`devcoll_user`)

**Communication:**
- Exposes HTTP REST API for synchronous requests
- Emits RabbitMQ events for async side effects
- Listens to RabbitMQ events from other services

**Responsibilities:**
- User profile management
- Follow/Unfollow relationships
- User search
- Followers/Following lists
- Profile privacy settings

**HTTP Endpoints (Synchronous):**
- `GET /users/:id` - Get user profile
- `PATCH /users/:id` - Update profile details
- `POST /users/:id/follow` - Follow another user
- `DELETE /users/:id/follow` - Unfollow user
- `GET /users/:id/followers` - Get followers list
- `GET /users/:id/following` - Get following list
- `GET /users/search?q=...` - Search users

**RabbitMQ Events Listened To:**
- `USER_REGISTERED` (from Auth Service) → Create user profile

**RabbitMQ Events Emitted:**
- `USER_UPDATED` → Update search index
- `USER_FOLLOWED` → Notify post/feed services
- `USER_DELETED` → Trigger cleanup in other services

---

### 4. Post Service (`apps/post-service`)
**Port:** 3003  
**Database:** PostgreSQL (`devcoll_post`)

**Communication:**
- Exposes HTTP REST API for synchronous requests
- Emits RabbitMQ events for async side effects

**Responsibilities:**
- Post CRUD operations
- Like/Unlike posts
- Comment management
- Feed generation
- Authorization checks ("can this user delete this post?")

**HTTP Endpoints (Synchronous):**
- `POST /posts` - Create new post
- `GET /posts/:id` - Get single post
- `PATCH /posts/:id` - Update post content
- `DELETE /posts/:id` - Delete post
- `GET /posts/feed` - Get user's personalized feed
- `GET /users/:userId/posts` - Get posts by user
- `POST /posts/:id/like` - Like post
- `DELETE /posts/:id/like` - Unlike post
- `POST /posts/:id/comments` - Add comment
- `DELETE /comments/:id` - Delete comment

**RabbitMQ Events Emitted:**
- `POST_CREATED` → Index in search service
- `POST_UPDATED` → Update search index
- `POST_DELETED` → Remove from search, clean up media
- `POST_LIKED` / `POST_UNLIKED` → Analytics
- `COMMENT_CREATED` → Notifications

---

### 5. Media Service (`apps/media-service`) **[NEW]**
**Port:** 3004  
**Database:** MongoDB (`devcoll_media`)

**Communication:**
- Exposes HTTP REST API for synchronous requests
- Listens to RabbitMQ events for cleanup

**Responsibilities:**
- File upload handling (images, videos, documents)
- File storage (local filesystem or S3)
- Media metadata management
- File type validation
- Thumbnail generation (future)
- Media cleanup when posts/users deleted

**HTTP Endpoints (Synchronous):**
- `POST /media/upload` - Upload file and store metadata
- `DELETE /media/:id` - Delete media file
- `GET /media/:id` - Get media details
- `GET /users/:userId/media` - Get all media by user

**RabbitMQ Events Listened To:**
- `USER_DELETED` → Delete all user's media
- `POST_DELETED` → Clean up orphaned media

**Storage:**
- Files saved to local disk: `./uploads/`
- Metadata stored in MongoDB
- Can be extended to use S3, Cloudinary, etc.

---

### 6. Search Service (`apps/search-service`) **[NEW]**
**Port:** 3005  
**Database:** MongoDB (`devcoll_search`)

**Communication:**
- Exposes HTTP REST API for synchronous search queries
- Listens to RabbitMQ events for index updates

**Responsibilities:**
- Full-text search for posts
- User search by username/name/bio
- Search index management
- Real-time index updates via events

**HTTP Endpoints (Synchronous):**
- `GET /search/posts?q=...` - Search posts by content
- `GET /search/users?q=...` - Search users by name/username

**RabbitMQ Events Listened To:**
- `POST_CREATED` → Index new post
- `POST_UPDATED` → Update post index
- `POST_DELETED` → Remove from index
- `USER_CREATED` → Index new user
- `USER_UPDATED` → Update user index
- `USER_DELETED` → Remove from index

**Implementation:**
- MongoDB text indexes for fast full-text search
- Can be replaced with Elasticsearch for advanced features

---

## 🔄 Request Flow Examples

### Example 1: User Registration (Hybrid Flow)

```
Step 1: Client → API Gateway (HTTP)
   POST /api/v1/auth/register
   Body: { email, username, password }

Step 2: Gateway → Auth Service (HTTP)
   POST http://auth-service:3001/auth/register
   Body: { email, username, password }

Step 3: Auth Service
   • Validates email/username uniqueness
   • Hashes password with bcrypt
   • Saves to PostgreSQL
   • Generates JWT tokens
   • Returns immediately with tokens
   • THEN emits event: USER_REGISTERED (RabbitMQ)

Step 4: Auth Service → Client (HTTP response)
   { success: true, tokens: { accessToken, refreshToken } }

Step 5: User Service (listens to RabbitMQ event)
   • Receives USER_REGISTERED event
   • Creates user profile asynchronously
   • Saves to PostgreSQL

Step 6: Search Service (listens to RabbitMQ event)
   • Receives USER_REGISTERED event
   • Indexes user for search
   • Saves to MongoDB
```

### Example 2: Create Post with Media (Hybrid Flow)

```
Step 1: Client → API Gateway (HTTP)
   POST /api/v1/posts
   Body: { content: "Hello", mediaUrls: ["url1"] }
   Header: Authorization: Bearer <JWT>

Step 2: Gateway validates JWT → extracts userId

Step 3: Gateway → Post Service (HTTP)
   POST http://post-service:3003/posts
   Body: { content: "Hello", mediaUrls: ["url1"] }
   Header: x-user-id: <userId>

Step 4: Post Service
   • Validates content
   • Checks authorization (is user allowed?)
   • Saves post to PostgreSQL
   • Returns immediately with post data
   • THEN emits event: POST_CREATED (RabbitMQ)

Step 5: Post Service → Gateway → Client (HTTP response)
   { success: true, data: { postId, content, ... } }

Step 6: Search Service (listens to RabbitMQ event)
   • Receives POST_CREATED event
   • Indexes post for search asynchronously
   • Saves to MongoDB

Step 7: Media Service (listens to RabbitMQ event)
   • Receives POST_CREATED event
   • Links media to post (if any)
   • Updates metadata
```

### Example 3: Get User Feed (HTTP Only)

```
Step 1: Client → API Gateway (HTTP)
   GET /api/v1/posts/feed?page=1&limit=20
   Header: Authorization: Bearer <JWT>

Step 2: Gateway validates JWT → extracts userId

Step 3: Gateway → Post Service (HTTP)
   GET http://post-service:3003/posts/feed?userId=<userId>&page=1&limit=20

Step 4: Post Service
   • Fetches followed users from database
   • Queries posts from followed users
   • Sorts by timestamp
   • Returns paginated feed

Step 5: Post Service → Gateway → Client (HTTP response)
   { success: true, data: { posts: [...], total: 100 } }

(No RabbitMQ needed - pure synchronous request)
```

---

## 🔐 Authentication & Authorization

### Authentication (Who are you?)
**Handled by:** API Gateway + Auth Service

```typescript
// API Gateway
@UseGuards(JwtAuthGuard)  // ✅ Only validates JWT token
async createPost(@CurrentUser('userId') userId: string) {
  // Forward to service
}
```

### Authorization (What can you do?)
**Handled by:** Individual services

```typescript
// Post Service
async deletePost(postId: string, userId: string) {
  const post = await this.findPost(postId);
  
  // ✅ Authorization happens in the service
  if (post.userId !== userId) {
    throw new ForbiddenException('Not your post');
  }
  
  await this.postRepository.delete(postId);
}
```

---

## 📡 Communication Patterns

### 1. Synchronous (HTTP/REST)
**Use for:** Operations that need immediate responses.

```typescript
// Gateway calls Post Service via HTTP
const response = await this.httpService.post(
  'http://post-service:3003/posts',
  createPostDto,
  { headers: { 'x-user-id': userId } }
);
return response.data;
```

**Use Cases:**
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Data retrieval (Get user profile, Get post)
- ✅ Operations requiring immediate feedback
- ✅ Authentication/Authorization checks

**Benefits:**
- Easy to debug (HTTP status codes, headers)
- Standard tooling (Postman, curl, browser)
- Native load balancing (Nginx, ALB)
- Clear error handling

### 2. Asynchronous (RabbitMQ Events)
**Use for:** Non-blocking operations and side effects.

```typescript
// Post Service emits event after creating post
this.rabbitClient.emit(EVENTS.POST_CREATED, {
  postId: post.id,
  userId: post.userId,
  content: post.content,
});

// Search Service listens and indexes
@EventPattern(EVENTS.POST_CREATED)
async handlePostCreated(@Payload() data) {
  await this.searchService.indexPost(data);
}
```

**Use Cases:**
- ✅ Search indexing
- ✅ Notifications (email, push)
- ✅ Analytics and logging
- ✅ Cache invalidation
- ✅ Cleanup tasks
- ✅ Data replication

**Benefits:**
- Non-blocking (service returns immediately)
- Eventual consistency
- Decoupling (services don't need to know about each other)
- Resilience (retry logic built-in)

### 3. When to Use Which?

| Scenario | Pattern | Why |
|----------|---------|-----|
| User creates post | HTTP (Gateway → Service) | Need immediate postId for client |
| Index post in search | RabbitMQ Event | Can happen asynchronously |
| User logs in | HTTP | Need immediate JWT tokens |
| Send welcome email | RabbitMQ Event | Don't block login response |
| Get user profile | HTTP | Need data immediately |
| Update user cache | RabbitMQ Event | Eventually consistent is fine |
| Delete post | HTTP | Need confirmation |
| Clean up media | RabbitMQ Event | Can happen in background |

---

## 🗄️ Database Strategy

### Database Per Service (Polyglot Persistence)

```
Auth Service    → PostgreSQL  (Relational data, ACID transactions)
User Service    → PostgreSQL  (User profiles, relationships)
Post Service    → PostgreSQL  (Posts, comments, likes)
Media Service   → MongoDB     (File metadata, flexible schema)
Search Service  → MongoDB     (Full-text search, indexing)
```

**Why?**
- ✅ Each service can choose the best database for its needs
- ✅ Services are loosely coupled (no shared database)
- ✅ Easier to scale services independently
- ✅ No cross-service database transactions (use sagas instead)

---

## 🚀 Running the Services

### Development (Individual Services)

```bash
# Start infrastructure first
docker compose up -d postgres-auth postgres-user postgres-post mongodb redis rabbitmq

# Build common library (first time only)
cd libs/common && npm run build && cd ../..

# Run services individually (each in separate terminal)
npm run dev:auth      # Port 3001 - HTTP + RabbitMQ
npm run dev:user      # Port 3002 - HTTP + RabbitMQ
npm run dev:post      # Port 3003 - HTTP + RabbitMQ
npm run dev:media     # Port 3004 - HTTP + RabbitMQ
npm run dev:search    # Port 3005 - HTTP + RabbitMQ
npm run dev:gateway   # Port 3000 - HTTP client

# Test individual service (without gateway)
curl -X POST http://localhost:3003/posts \
  -H "Content-Type: application/json" \
  -H "x-user-id: 123" \
  -d '{"content": "Hello World"}'

# Test via gateway
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello World"}'
```

### Production (Docker)

```bash
# Start everything
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f api-gateway
docker compose logs -f post-service

# Health check
curl http://localhost:3000/health
```

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **API Gateway** | NestJS, HttpModule, JWT, Swagger | HTTP routing to services |
| **Auth Service** | NestJS, Prisma, PostgreSQL, bcrypt | Authentication & JWT |
| **User Service** | NestJS, Prisma, PostgreSQL | User profiles & relationships |
| **Post Service** | NestJS, Prisma, PostgreSQL | Posts, comments, likes |
| **Media Service** | NestJS, MongoDB, Mongoose, Multer | File uploads & storage |
| **Search Service** | NestJS, MongoDB, Mongoose | Full-text search |
| **Message Broker** | RabbitMQ | Async events only |
| **Caching** | Redis | Session storage & caching |
| **API Documentation** | Swagger/OpenAPI | Interactive API docs |
| **Service-to-Service** | HTTP/REST | Synchronous communication |

---

## 📊 Key Differences from Previous Architecture

| Aspect | Old (Full RabbitMQ) | New (HTTP/REST + RabbitMQ) |
|--------|---------------------|----------------------------|
| **Gateway → Service** | RabbitMQ TCP messages | HTTP/REST calls |
| **Service → Service** | RabbitMQ messages | HTTP calls (sync) or Events (async) |
| **Debugging** | Complex (inspect queues) | Easy (HTTP logs, status codes) |
| **Tooling** | Limited | Postman, curl, browser |
| **Load Balancing** | Requires service mesh | Native (Nginx, ALB, K8s) |
| **Industry Standard** | Learning/prototyping | Production (Netflix, Uber) |
| **Status Codes** | Custom in payload | HTTP 200, 400, 500 |
| **Error Handling** | Manual | HTTP exceptions |
| **Latency (Sync)** | ~5-10ms | ~10-20ms (negligible) |
| **When to Use** | All communication | Only async events |

---

## 📊 Comparison: Monolith vs Microservices

| Aspect | Monolith | This Microservices Architecture |
|--------|----------|----------------------------------|
| **Deployment** | Single app | 6 independent services |
| **Database** | One shared DB | 5 separate databases (Polyglot) |
| **Scaling** | Scale everything | Scale services independently |
| **Technology** | One stack | Mix (PostgreSQL + MongoDB) |
| **Failure** | One failure = total downtime | Service failures are isolated |
| **Communication** | Function calls | HTTP (sync) + RabbitMQ (async) |
| **Development** | Tight coupling | Loose coupling via HTTP + events |
| **Testing** | Test entire app | Test services in isolation |

---

## 🎓 Best Practices Implemented

✅ **HTTP/REST for synchronous calls** (Gateway → Services)
✅ **RabbitMQ exclusively for async events** (side effects)
✅ **API Gateway doesn't contain business logic**
✅ **Each service has its own database**
✅ **Authorization happens in services, not gateway**
✅ **Events for side effects and eventual consistency**
✅ **Standard HTTP status codes and error handling**
✅ **Easy debugging with curl, Postman, browser**
✅ **Native load balancing support**
✅ **Service discovery via Docker network**
✅ **Health checks for all services**
✅ **Docker for containerization**
✅ **Swagger for API documentation**
✅ **Industry-standard patterns (Netflix, Uber, Shopify)**

---

## 🔮 Future Enhancements

### Already Planned:
- [ ] Migrate from TCP to HTTP/REST (see `MIGRATION_TO_HTTP.md`)
- [ ] Add **gRPC** for ultra-low latency service-to-service calls
- [ ] Implement **circuit breakers** (Resilience4j, Hystrix)
- [ ] Add **distributed tracing** (Jaeger, Zipkin, OpenTelemetry)
- [ ] Implement **saga pattern** for distributed transactions
- [ ] Add **Elasticsearch** for advanced search features
- [ ] Implement **S3/Cloudinary** for media storage
- [ ] Add **notification service** for real-time notifications (WebSocket)
- [ ] Implement **CQRS** for read/write separation
- [ ] Add **Kafka** for high-throughput event streaming
- [ ] Implement **service mesh** (Istio, Linkerd) for advanced traffic management
- [ ] Add **API rate limiting** per user
- [ ] Implement **JWT refresh token rotation**
- [ ] Add **Prometheus + Grafana** for monitoring

---

## � Why This Architecture is Production-Grade

### 1. **Industry Standard**
- Netflix uses HTTP/REST + gRPC for services, Kafka for events
- Uber uses gRPC for all internal services, Kafka for streaming
- Shopify uses HTTP/REST for APIs, gRPC for internal, RabbitMQ for jobs
- Airbnb uses HTTP/REST + gRPC, Kafka for events

### 2. **Easy to Debug**
```bash
# Can test services directly with curl
curl -X POST http://localhost:3003/posts \
  -H "Content-Type: application/json" \
  -H "x-user-id: 123" \
  -d '{"content": "Hello"}'

# Can use Postman for all endpoints
# Can see HTTP status codes: 200, 400, 404, 500
# Can inspect HTTP headers and response times
```

### 3. **Native Load Balancing**
```yaml
# Kubernetes Service (auto load balancing)
apiVersion: v1
kind: Service
metadata:
  name: post-service
spec:
  selector:
    app: post-service
  ports:
    - protocol: TCP
      port: 3003
      targetPort: 3003

# Nginx load balancer
upstream post_service {
  server post-service-1:3003;
  server post-service-2:3003;
  server post-service-3:3003;
}
```

### 4. **Clear Separation of Concerns**
- **Synchronous operations** → HTTP/REST (need immediate response)
- **Asynchronous side effects** → RabbitMQ Events (fire and forget)
- No confusion about which pattern to use

### 5. **Standard Error Handling**
```typescript
// HTTP gives you standard status codes
try {
  const response = await httpService.post(...);
  return response.data; // 200 OK
} catch (error) {
  if (error.response.status === 404) {
    throw new NotFoundException('Post not found');
  }
  if (error.response.status === 403) {
    throw new ForbiddenException('Not authorized');
  }
  throw new BadRequestException('Invalid request');
}
```

---

## 📚 Resources

- [NestJS HTTP Module](https://docs.nestjs.com/techniques/http-module)
- [Microservices Patterns](https://microservices.io/patterns/index.html)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [Database per Service](https://microservices.io/patterns/data/database-per-service.html)
- [Event-Driven Architecture](https://microservices.io/patterns/data/event-driven-architecture.html)
- [Synchronous vs Asynchronous Messaging](https://microservices.io/patterns/communication-style/messaging.html)
- [gRPC vs REST](https://www.nginx.com/blog/nginx-1-13-10-grpc/)
- [Netflix Microservices](https://netflixtechblog.com/)
- [Uber's Microservice Architecture](https://eng.uber.com/microservice-architecture/)
- [Migration Guide](./MIGRATION_TO_HTTP.md) - Step-by-step HTTP migration

---

**This architecture follows industry-standard microservices patterns used by Netflix, Uber, Shopify, Airbnb, and other tech giants.**

**For migration instructions, see `MIGRATION_TO_HTTP.md`.**

