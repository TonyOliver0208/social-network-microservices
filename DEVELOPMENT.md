# 🎯 Development Guide - DevColl Microservices

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Microservices Communication](#microservices-communication)
3. [Database Design](#database-design)
4. [API Patterns](#api-patterns)
5. [Event-Driven Architecture](#event-driven-architecture)
6. [Best Practices](#best-practices)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)

---

## Project Architecture

### 🏗️ High-Level Overview

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       │ HTTP/REST
       │
┌──────▼──────────────────────────────────────────┐
│           API Gateway (Port 3000)                │
│  - Routing                                       │
│  - Authentication Middleware                     │
│  - Rate Limiting                                 │
│  - Request/Response Transformation               │
└───┬────┬────┬────┬────┬────────────────────────┘
    │    │    │    │    │
    │ TCP│TCP │TCP │TCP │TCP
    │    │    │    │    │
    ▼    ▼    ▼    ▼    ▼
┌─────┬──────┬──────┬──────┬──────┐
│Auth │User  │Post  │Media │Search│
│3001 │3002  │3003  │3004  │3005  │
└──┬──┴───┬──┴───┬──┴───┬──┴───┬──┘
   │      │      │      │      │
   │  ┌───▼──────▼──────▼──────▼───┐
   │  │      RabbitMQ (Events)     │
   │  └────────────────────────────┘
   │
   ├──► PostgreSQL (Auth)
   ├──► PostgreSQL (User)
   ├──► PostgreSQL (Post)
   ├──► MongoDB (Media)
   ├──► MongoDB (Search)
   └──► Redis (Cache)
```

### 🔄 Service Responsibilities

#### API Gateway (Port 3000)
- **Purpose**: HTTP entry point for all client requests
- **Tech**: NestJS + Express
- **Features**:
  - Route forwarding to microservices
  - JWT validation
  - Rate limiting (100 req/min)
  - CORS handling
  - Request logging
  - Swagger documentation

#### Auth Service (Port 3001)
- **Purpose**: Authentication & Authorization
- **Database**: PostgreSQL
- **Features**:
  - User registration
  - Login/Logout
  - JWT token generation
  - Refresh token rotation
  - Password hashing (bcrypt)
  - Account verification

#### User Service (Port 3002)
- **Purpose**: User profiles & relationships
- **Database**: PostgreSQL
- **Features**:
  - User profiles (bio, avatar, links)
  - Follow/Unfollow system
  - User search
  - Profile updates
  - Follower/Following lists

#### Post Service (Port 3003)
- **Purpose**: Posts, comments, likes, feed
- **Database**: PostgreSQL
- **Features**:
  - CRUD posts
  - Comments (nested)
  - Like/Unlike
  - Personalized feed algorithm
  - Trending posts

#### Media Service (Port 3004)
- **Purpose**: File uploads & management
- **Database**: MongoDB
- **Features**:
  - Image/video upload to Cloudinary
  - Metadata storage
  - Thumbnail generation
  - File validation
  - CDN delivery

#### Search Service (Port 3005)
- **Purpose**: Full-text search
- **Database**: MongoDB (text indexes)
- **Features**:
  - Post search
  - User search
  - Auto-complete
  - Search suggestions
  - Result caching

---

## Microservices Communication

### 🔌 Communication Patterns

#### 1. Synchronous (TCP) - Request/Response
Used for immediate responses needed by the client.

**Example: API Gateway → Auth Service**
```typescript
// API Gateway calls Auth Service
const result = await firstValueFrom(
  this.authClient.send(MESSAGES.AUTH_VALIDATE_TOKEN, { token })
);
```

**When to use:**
- User authentication
- Data retrieval (get user, get post)
- Operations requiring immediate response

#### 2. Asynchronous (RabbitMQ) - Event-Driven
Used for background processing and service-to-service updates.

**Example: Post Created Event**
```typescript
// Post Service publishes event
this.eventClient.emit(EVENTS.POST_CREATED, {
  postId,
  userId,
  content,
  createdAt,
});

// Search Service listens and indexes
@EventPattern(EVENTS.POST_CREATED)
async handlePostCreated(data: PostCreatedEvent) {
  await this.indexPost(data);
}
```

**When to use:**
- Search indexing
- Cache invalidation
- Notifications
- Analytics tracking
- Email sending

---

## Database Design

### 📊 PostgreSQL Schemas

#### Auth Service
```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  username      String         @unique
  password      String         // bcrypt hashed
  isVerified    Boolean        @default(false)
  isActive      Boolean        @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

#### User Service
```prisma
model Profile {
  id        String   @id @default(uuid())
  userId    String   @unique
  fullName  String?
  bio       String?  @db.Text
  avatar    String?
  website   String?
  location  String?
  birthDate DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Follow {
  id          String   @id @default(uuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}
```

#### Post Service
```prisma
model Post {
  id        String    @id @default(uuid())
  userId    String
  content   String    @db.Text
  mediaIds  String[]  // References to Media Service
  likes     Int       @default(0)
  comments  Int       @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  Comment   Comment[]
  Like      Like[]
  
  @@index([userId])
  @@index([createdAt])
}

model Comment {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  content   String   @db.Text
  parentId  String?  // For nested comments
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  post      Post     @relation(fields: [postId], references: [id])
  
  @@index([postId])
  @@index([userId])
}

model Like {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())
  post      Post     @relation(fields: [postId], references: [id])
  
  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
}
```

### 🍃 MongoDB Schemas

#### Media Service
```typescript
{
  _id: ObjectId,
  publicId: String,        // Cloudinary ID
  originalName: String,
  mimeType: String,
  url: String,             // CDN URL
  thumbnailUrl: String,
  userId: String,
  resourceType: 'image' | 'video',
  size: Number,
  dimensions: {
    width: Number,
    height: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Search Service
```typescript
{
  _id: ObjectId,
  postId: String,
  userId: String,
  content: String,         // Full-text indexed
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Patterns

### 🎯 RESTful Endpoint Structure

```
/api/v1/
  ├── auth/
  │   ├── POST   /register
  │   ├── POST   /login
  │   ├── POST   /refresh
  │   ├── POST   /logout
  │   └── GET    /me
  │
  ├── users/
  │   ├── GET    /:id
  │   ├── PATCH  /profile
  │   ├── POST   /:id/follow
  │   ├── DELETE /:id/follow
  │   ├── GET    /:id/followers
  │   ├── GET    /:id/following
  │   └── GET    /search?q=
  │
  ├── posts/
  │   ├── POST   /
  │   ├── GET    /:id
  │   ├── PATCH  /:id
  │   ├── DELETE /:id
  │   ├── GET    /feed
  │   ├── POST   /:id/like
  │   ├── DELETE /:id/like
  │   └── GET    /:id/comments
  │
  ├── media/
  │   ├── POST   /upload
  │   ├── GET    /
  │   └── DELETE /:id
  │
  └── search/
      ├── GET    /posts?q=
      └── GET    /users?q=
```

### 📝 Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-10-14T10:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2025-10-14T10:00:00.000Z",
  "path": "/api/v1/auth/register"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Event-Driven Architecture

### 📡 Event Patterns

#### Published Events

```typescript
// User Events
EVENTS.USER_CREATED        // { userId, email, username }
EVENTS.USER_UPDATED        // { userId, changes }
EVENTS.USER_FOLLOWED       // { followerId, followingId }

// Post Events
EVENTS.POST_CREATED        // { postId, userId, content, mediaIds }
EVENTS.POST_UPDATED        // { postId, changes }
EVENTS.POST_DELETED        // { postId, userId }
EVENTS.POST_LIKED          // { postId, userId }

// Media Events
EVENTS.MEDIA_UPLOADED      // { mediaId, userId, url }
EVENTS.MEDIA_DELETED       // { mediaId, userId }
```

#### Event Handlers

```typescript
// Search Service - Index when post created
@EventPattern(EVENTS.POST_CREATED)
async handlePostCreated(data: PostCreatedEvent) {
  await this.searchService.indexPost({
    postId: data.postId,
    userId: data.userId,
    content: data.content,
    createdAt: data.createdAt,
  });
  
  // Invalidate cache
  await this.cacheService.del(`feed:${data.userId}:*`);
}

// Post Service - Clean up when media deleted
@EventPattern(EVENTS.MEDIA_DELETED)
async handleMediaDeleted(data: MediaDeletedEvent) {
  await this.postService.removeMediaReference(data.mediaId);
}
```

---

## Best Practices

### ✅ Code Quality

1. **Use DTOs for validation**
```typescript
export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsArray()
  @IsOptional()
  mediaIds?: string[];
}
```

2. **Implement proper error handling**
```typescript
try {
  const result = await this.service.create(data);
  return { success: true, data: result };
} catch (error) {
  this.logger.error(`Create failed: ${error.message}`);
  throw new HttpException(
    error.message,
    error.status || HttpStatus.INTERNAL_SERVER_ERROR
  );
}
```

3. **Use caching strategically**
```typescript
const cacheKey = `user:profile:${userId}`;
let profile = await this.cacheService.get(cacheKey);

if (!profile) {
  profile = await this.prisma.profile.findUnique({ where: { userId } });
  await this.cacheService.set(cacheKey, profile, 3600); // 1 hour
}

return profile;
```

4. **Implement pagination**
```typescript
async getPosts(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const [posts, total] = await Promise.all([
    this.prisma.post.findMany({ skip, take: limit }),
    this.prisma.post.count(),
  ]);
  
  return {
    data: posts,
    pagination: calculatePagination(page, limit, total),
  };
}
```

### 🔒 Security

1. **Always hash passwords**
```typescript
const hashedPassword = await bcrypt.hash(password, 12);
```

2. **Validate JWT tokens**
```typescript
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user) {
  return this.userService.getProfile(user.userId);
}
```

3. **Sanitize user input**
```typescript
@IsEmail()
@IsNotEmpty()
email: string;
```

4. **Rate limiting**
```typescript
@Throttle(10, 60) // 10 requests per minute
async login(@Body() loginDto: LoginDto) {
  // ...
}
```

---

## Testing Strategy

### 🧪 Unit Tests

```typescript
describe('AuthService', () => {
  it('should hash password during registration', async () => {
    const password = 'Test1234!';
    const result = await authService.register({
      email: 'test@example.com',
      username: 'testuser',
      password,
    });
    
    expect(result.data.user.password).not.toBe(password);
  });
});
```

### 🔗 Integration Tests

```typescript
describe('POST /api/v1/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test1234!',
      })
      .expect(201);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
  });
});
```

---

## Deployment

### 🐳 Docker Production

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale post-service=3
```

### ☸️ Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: devcoll/auth-service:latest
        ports:
        - containerPort: 3001
```

---

**Happy Development! 🚀**
