# 🏗️ Microservices Communication Patterns

This document explains the communication architecture for the DevColl Social Network Microservices.

## 📊 Architecture Overview

```
┌─────────────┐
│   Client    │
│ (Web/Mobile)│
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────┐
│   API Gateway       │
│  (Port 3000)        │
└──────┬──────────────┘
       │
       │ gRPC (Synchronous)
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│ Auth Service │      │ User Service │
│  Port 50051  │      │  Port 50052  │
└──────┬───────┘      └──────┬───────┘
       │                     │
       │  RabbitMQ (Async)   │
       └──────┬──────────────┘
              │
       ┌──────┴──────┬───────────┬──────────┐
       ▼             ▼           ▼          ▼
┌─────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Post Service │ │Media Svc │ │Search Svc│ │Email Svc │
│ Port 50053  │ │Port 50054│ │Port 50055│ │  (Future)│
└─────────────┘ └──────────┘ └──────────┘ └──────────┘
```

## 🔄 Communication Protocols

### 1️⃣ **gRPC (Gateway ↔ Services)**

**Used For:** Synchronous, request-response operations where the client needs immediate feedback.

**When to Use:**
- ✅ User authentication & authorization
- ✅ Data retrieval (GET operations)
- ✅ CRUD operations requiring confirmation
- ✅ Operations that must complete before responding to client

**Implementation:**
```typescript
// Service Controller
@GrpcMethod('AuthService', 'Login')
async login(loginDto: LoginDto): Promise<ServiceResponse> {
  return this.authService.login(loginDto);
}

// Gateway calling service
const result = await lastValueFrom(this.authService.Login(loginDto));
```

**Services Exposed via gRPC:**
- **Auth Service** (50051): Register, Login, RefreshToken, Logout, ValidateToken
- **User Service** (50052): GetProfile, UpdateProfile, Follow/Unfollow, GetFollowers, SearchUsers
- **Post Service** (50053): CreatePost, GetPost, UpdatePost, DeletePost, GetFeed, Like/Unlike, Comments
- **Media Service** (50054): UploadMedia, DeleteMedia, GetUserMedia
- **Search Service** (50055): SearchPosts, SearchUsers

---

### 2️⃣ **RabbitMQ (Service ↔ Service)**

**Used For:** Asynchronous, event-driven communication for operations that don't require immediate response.

**When to Use:**
- ✅ Notifying other services of state changes
- ✅ Background processing (email, notifications)
- ✅ Data synchronization across services
- ✅ Search index updates
- ✅ Analytics & logging

**Implementation:**
```typescript
// Emitting an event (Producer)
this.rmqClient.emit(EVENTS.USER_CREATED, {
  userId: user.id,
  email: user.email,
  username: user.username,
});

// Listening to events (Consumer)
@EventPattern(EVENTS.USER_CREATED)
async handleUserCreated(@Payload() data: { userId: string; email: string }) {
  // Handle event asynchronously
}
```

---

## 📋 Event Catalog

### **Auth Service Events**

| Event | Emitted By | Consumed By | Purpose |
|-------|------------|-------------|---------|
| `USER_REGISTERED` | Auth Service | User Service, Search Service | Create user profile & index |
| `USER_LOGGED_IN` | Auth Service | Analytics Service | Track login activity |
| `PASSWORD_RESET` | Auth Service | Email Service | Send password reset email |

### **User Service Events**

| Event | Emitted By | Consumed By | Purpose |
|-------|------------|-------------|---------|
| `USER_UPDATED` | User Service | Search Service | Update user index |
| `USER_DELETED` | User Service | All Services | Cleanup user data |
| `USER_FOLLOWED` | User Service | Post Service, Notification | Update feeds |
| `USER_UNFOLLOWED` | User Service | Post Service | Update feeds |

### **Post Service Events**

| Event | Emitted By | Consumed By | Purpose |
|-------|------------|-------------|---------|
| `POST_CREATED` | Post Service | Search Service, User Service, Media Service | Index post, update stats |
| `POST_UPDATED` | Post Service | Search Service | Update search index |
| `POST_DELETED` | Post Service | Search Service, Media Service, User Service | Cleanup references |
| `POST_LIKED` | Post Service | Search Service, User Service, Notification | Update rankings |
| `POST_UNLIKED` | Post Service | Search Service | Update rankings |
| `COMMENT_CREATED` | Post Service | Search Service, Notification | Update post, notify |
| `COMMENT_UPDATED` | Post Service | Search Service | Update index |
| `COMMENT_DELETED` | Post Service | Search Service | Update index |

### **Media Service Events**

| Event | Emitted By | Consumed By | Purpose |
|-------|------------|-------------|---------|
| `MEDIA_UPLOADED` | Media Service | Analytics | Track uploads |
| `MEDIA_DELETED` | Media Service | Post Service | Remove references |

---

## 🎯 Real-World Decision Matrix

### Use **gRPC** When:

| Scenario | Reason |
|----------|--------|
| User login | Must return JWT token immediately |
| Fetch user profile | Client needs data to render UI |
| Create post | User expects confirmation |
| Upload media | User waits for upload URL |
| Search queries | Real-time results expected |

### Use **RabbitMQ** When:

| Scenario | Reason |
|----------|--------|
| Send welcome email | No need to block registration |
| Update search index | Can happen in background |
| Generate notifications | User doesn't wait for this |
| Update analytics | Fire-and-forget |
| Sync data across services | Eventual consistency is OK |

---

## 🔐 Security Considerations

### gRPC Security:
- Use TLS for production
- Implement JWT validation in each service
- Rate limiting at Gateway level

### RabbitMQ Security:
- Use separate queues per service
- Enable message acknowledgment
- Set up dead-letter queues for failures
- Use durable queues for critical events

---

## 📈 Performance Patterns

### Circuit Breaker (gRPC):
```typescript
// If service is down, fail fast
try {
  const result = await lastValueFrom(
    this.authService.Login(loginDto).pipe(
      timeout(5000), // 5s timeout
      retry(2)       // Retry twice
    )
  );
} catch (error) {
  throw new ServiceUnavailableException('Auth service unavailable');
}
```

### Event Deduplication (RabbitMQ):
```typescript
@EventPattern(EVENTS.USER_CREATED)
async handleUserCreated(@Payload() data: { userId: string; idempotencyKey: string }) {
  // Check if already processed
  const processed = await this.cache.get(`event:${data.idempotencyKey}`);
  if (processed) return;
  
  // Process event
  await this.processUserCreation(data);
  
  // Mark as processed
  await this.cache.set(`event:${data.idempotencyKey}`, true, 3600);
}
```

---

## 🚀 Future Enhancements

1. **Service Discovery**: Consul/etcd for dynamic service registration
2. **API Gateway Features**:
   - Rate limiting (Redis + Throttler)
   - Response caching
   - Request tracing (OpenTelemetry)
3. **Message Queues**: Consider Kafka for high-throughput scenarios
4. **Circuit Breakers**: Implement Hystrix/resilience4js
5. **Event Sourcing**: Store events for audit trail

---

## 📝 Service Startup Order

For local development:

```bash
# 1. Start infrastructure
docker-compose up -d  # PostgreSQL, MongoDB, RabbitMQ, Redis

# 2. Start services (can run in parallel)
npm run dev:auth      # Port 50051
npm run dev:user      # Port 50052
npm run dev:post      # Port 50053
npm run dev:media     # Port 50054
npm run dev:search    # Port 50055

# 3. Start API Gateway (last)
npm run dev:gateway   # Port 3000
```

---

## 🧪 Testing Communication

### Test gRPC:
```bash
# Using grpcurl
grpcurl -plaintext -d '{"email": "test@example.com", "password": "password"}' \
  localhost:50051 auth.AuthService/Login
```

### Test RabbitMQ:
```typescript
// Emit test event
this.rmqClient.emit(EVENTS.USER_CREATED, {
  userId: 'test-123',
  email: 'test@example.com',
});
```

---

## 📚 References

- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [gRPC Best Practices](https://grpc.io/docs/guides/performance/)
- [RabbitMQ Patterns](https://www.rabbitmq.com/getstarted.html)
