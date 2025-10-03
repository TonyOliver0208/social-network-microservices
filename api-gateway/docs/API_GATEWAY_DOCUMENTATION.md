# API Gateway Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Running the Gateway](#running-the-gateway)
- [API Endpoints](#api-endpoints)
- [Middleware](#middleware)
- [Proxy Services](#proxy-services)
- [Security](#security)
- [Logging & Monitoring](#logging--monitoring)
- [Error Handling](#error-handling)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

The API Gateway serves as the single entry point for all client requests to the microservices architecture. It handles authentication, authorization, request routing, rate limiting, logging, and provides a unified API interface.

### Key Features
- 🔒 **Authentication & Authorization** - JWT token validation
- 🚦 **Rate Limiting** - Redis-based with configurable limits
- 🔄 **Request Proxying** - Routes to appropriate microservices
- 📊 **Request Logging** - Comprehensive request/response tracking
- 🛡️ **Security Headers** - CORS, Helmet security middleware
- 🔍 **Distributed Tracing** - Request ID and Correlation ID tracking
- ⚡ **Error Handling** - Centralized error management
- 📈 **Health Checks** - Service status monitoring

## Architecture

```
Client Request
     ↓
API Gateway (Port 4000)
     ↓
┌─────────────────────────────────┐
│        Middleware Stack         │
├─ CORS                          │
├─ Security Headers              │
├─ Request ID Generation         │
├─ Correlation ID Tracking       │
├─ Rate Limiting                 │
├─ Request Logging               │
├─ Authentication (Protected)    │
└─ Error Handling                │
     ↓
┌─────────────────────────────────┐
│         Route Proxying          │
├─ /v1/auth → Auth Service       │
├─ /v1/users → Identity Service  │
├─ /v1/posts → Post Service      │
├─ /v1/media → Media Service     │
└─ /v1/search → Search Service   │
```

## Prerequisites

- **Node.js** >= 16.x
- **TypeScript** >= 4.x
- **Redis** (for rate limiting & caching)
- **Docker** (optional, for containerized deployment)

## Installation & Setup

### 1. Clone and Install Dependencies
```bash
cd Microservices/api-gateway
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Build TypeScript
```bash
npm run build
```

## Configuration

### Project Structure
```
src/
├── config/           # Configuration files
│   ├── environment.ts    # Environment validation with Zod
│   ├── cors.ts          # CORS configuration
│   ├── logger.ts        # Winston logger setup
│   ├── rateLimiter.ts   # Rate limiting config
│   └── security.ts      # Security headers config
├── middleware/       # Express middleware
│   ├── authMiddleware.ts    # JWT authentication
│   ├── rateLimiter.ts      # Rate limiting middleware
│   ├── request-logger.ts   # Request logging
│   ├── errorHandler.ts     # Global error handler
│   └── requestId.ts        # Request/Correlation ID
├── proxies/         # Service proxies
│   ├── authServiceProxy.ts
│   ├── identityService.ts
│   ├── mediaService.ts
│   ├── postService.ts
│   └── searchService.ts
├── routes/          # API routes
├── types/           # TypeScript types
├── utils/           # Utilities
└── server.ts        # Main application
```

## Environment Variables

### Required Variables
```bash
# Server Configuration
NODE_ENV=development|staging|production
PORT=4000

# Authentication
JWT_SECRET=your-32-character-secret-key
GOOGLE_CLIENT_ID=your-google-client-id

# Microservice URLs
AUTH_SERVICE_URL=http://localhost:3001
IDENTITY_SERVICE_URL=http://localhost:3002
POST_SERVICE_URL=http://localhost:3003
MEDIA_SERVICE_URL=http://localhost:3004
SEARCH_SERVICE_URL=http://localhost:3005

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100     # requests per window

# Optional
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost
LOG_LEVEL=info|debug|warn|error
REQUEST_TIMEOUT=30000           # 30 seconds
```

### Environment-Specific Configs

#### Development
```bash
NODE_ENV=development
LOG_LEVEL=debug
# CORS allows localhost origins
# Detailed error messages enabled
# Request logging verbose
```

#### Staging
```bash
NODE_ENV=staging
LOG_LEVEL=info
# CORS allows staging domains
# Basic security headers
# Moderate logging
```

#### Production
```bash
NODE_ENV=production
LOG_LEVEL=warn
# CORS restricted to production domains
# Full security headers (HSTS, CSP)
# Optimized logging
# Metrics collection enabled
```

## Running the Gateway

### Development Mode
```bash
npm run dev
# Uses nodemon for auto-restart on changes
```

### Production Mode
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t api-gateway .
docker run -p 4000:4000 --env-file .env api-gateway
```

### Health Check
```bash
curl http://localhost:4000/v1/health
```

## API Endpoints

### Health & Status
- `GET /v1/health` - Health check endpoint
- `GET /v1/docs` - API documentation

### Authentication (Public)
- `POST /v1/auth/google` - Google OAuth token exchange
- `POST /v1/auth/refresh` - Refresh JWT tokens
- `POST /v1/auth/logout` - Logout user

### Protected Endpoints (Require Authentication)
- `GET /v1/users/*` - Identity service endpoints
- `GET /v1/posts/*` - Post service endpoints  
- `GET /v1/media/*` - Media service endpoints
- `GET /v1/search/*` - Search service endpoints

### Request Format
```javascript
// Headers required for protected endpoints
{
  "Authorization": "Bearer <jwt-token>",
  "Content-Type": "application/json",
  "x-request-id": "optional-request-id"
}
```

### Response Format
```javascript
{
  "success": true|false,
  "message": "Response message",
  "data": {}, // Response data
  "timestamp": "2025-10-02T10:30:00.000Z",
  "requestId": "req_abc123"
}
```

## Middleware

### 1. CORS (Cross-Origin Resource Sharing)
```typescript
// Configured per environment
development: ["http://localhost:3000", "http://localhost:3001"]
staging: ["https://staging-devcoll.com"]
production: ["https://devcoll.com", "https://www.devcoll.com"]
```

### 2. Security Headers (Helmet)
```typescript
// Production security headers
- Content Security Policy
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
```

### 3. Rate Limiting
```typescript
// General endpoints: 100 requests/15 minutes
// Auth endpoints: 20 requests/15 minutes
// Redis-based storage for distributed limiting
```

### 4. Request Logging
```typescript
// Logs every request with:
- Method, URL, status code
- Duration, request ID, correlation ID
- User ID (if authenticated)
- Error details (if failed)
```

### 5. Authentication Middleware
```typescript
// JWT token validation
- Extracts Bearer token from Authorization header
- Validates token signature and expiration
- Sets req.user with decoded payload
- Adds user info to request context
```

## Proxy Services

### Service Routing
```typescript
/v1/auth/*   → AUTH_SERVICE_URL/api/*
/v1/users/*  → IDENTITY_SERVICE_URL/api/*
/v1/posts/*  → POST_SERVICE_URL/api/*
/v1/media/*  → MEDIA_SERVICE_URL/api/*
/v1/search/* → SEARCH_SERVICE_URL/api/*
```

### Header Forwarding
Each proxy forwards these headers to downstream services:
- `x-request-id` - Request tracking
- `x-correlation-id` - Distributed tracing
- `x-internal-token` - Service authentication
- `x-user-id` - Authenticated user ID
- `x-user-email` - User email

### Error Handling
```typescript
// Proxy error responses
{
  "success": false,
  "message": "Service temporarily unavailable",
  "error": "Internal server error",
  "timestamp": "2025-10-02T10:30:00.000Z",
  "requestId": "req_abc123"
}
```

## Security

### 1. Authentication Flow
```
1. Client sends Google OAuth token to /v1/auth/google
2. Auth service validates Google token
3. Auth service returns internal JWT token
4. Client uses JWT for subsequent requests
5. API Gateway validates JWT on protected routes
```

### 2. JWT Token Structure
```javascript
{
  "userId": "user_123",
  "email": "user@example.com", 
  "name": "User Name",
  "role": "user|admin",
  "iss": "devcoll-auth-service",
  "aud": "devcoll-api-gateway",
  "exp": 1696123456
}
```

### 3. Security Best Practices
- ✅ JWT tokens with expiration
- ✅ HTTPS enforcement in production
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Rate limiting to prevent abuse
- ✅ Input validation and sanitization
- ✅ Error message sanitization
- ✅ CORS restrictions per environment

## Logging & Monitoring

### Log Levels
```typescript
error   - Application errors, failures
warn    - Warnings, rate limit exceeded
info    - General information, successful requests
debug   - Detailed debugging information
http    - HTTP request/response logging
```

### Log Files
```
logs/
├── combined.log        # All logs
├── error.log          # Error level only
├── exceptions.log     # Uncaught exceptions
└── rejections.log     # Unhandled promise rejections
```

### Log Format
```json
{
  "level": "info",
  "message": "GET /v1/users/123",
  "statusCode": 200,
  "duration": "45ms",
  "requestId": "req_abc123",
  "correlationId": "corr_def456",
  "userId": "user_789",
  "service": "api-gateway",
  "timestamp": "2025-10-02T10:30:00.000Z"
}
```

### Metrics & Monitoring
- Request count and response times
- Error rates by endpoint
- Rate limiting statistics
- Service health checks
- Resource usage (CPU, Memory)

## Error Handling

### Global Error Handler
```typescript
// Handles all application errors
- Validation errors (400)
- Authentication errors (401) 
- Authorization errors (403)
- Not found errors (404)
- Rate limit errors (429)
- Internal server errors (500)
```

### Error Response Format
```javascript
{
  "success": false,
  "message": "Human-readable error message",
  "error": "ERROR_CODE",
  "timestamp": "2025-10-02T10:30:00.000Z",
  "requestId": "req_abc123",
  "stack": "Error stack trace" // Only in development
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Invalid request data
- `AUTHENTICATION_REQUIRED` - Missing or invalid token
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVICE_UNAVAILABLE` - Downstream service error
- `INTERNAL_SERVER_ERROR` - Unexpected server error

## Development

### Available Scripts
```bash
npm run dev          # Start in development mode
npm run build        # Build TypeScript
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

### Development Workflow
1. **Setup Environment** - Configure `.env` file
2. **Start Services** - Ensure all microservices are running
3. **Start Gateway** - `npm run dev`
4. **Test Endpoints** - Use Postman or curl
5. **Check Logs** - Monitor `logs/combined.log`

### Adding New Services
1. **Add Environment Variable**
   ```typescript
   // config/environment.ts
   NEW_SERVICE_URL: z.string().url('Invalid New Service URL')
   ```

2. **Create Proxy**
   ```typescript
   // proxies/newService.ts
   const newServiceProxy = proxy(env.NEW_SERVICE_URL, proxyConfigs);
   ```

3. **Add Route**
   ```typescript
   // routes/v1/index.ts
   router.use('/new-feature', requireAuth, newServiceProxy);
   ```

## Deployment

### Docker Deployment
```dockerfile
# Multi-stage build for optimized image
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
PORT=4000
JWT_SECRET=${SECURE_JWT_SECRET}
REDIS_URL=${REDIS_CONNECTION_STRING}
# ... other production configs
```

### Health Checks
```yaml
# Docker Compose health check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:4000/v1/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Load Balancing
```nginx
# Nginx configuration example
upstream api_gateway {
    server api-gateway-1:4000;
    server api-gateway-2:4000;
    server api-gateway-3:4000;
}

server {
    listen 80;
    server_name api.devcoll.com;
    
    location / {
        proxy_pass http://api_gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Troubleshooting

### Common Issues

#### 1. Service Connection Errors
```bash
# Check service URLs in .env
echo $AUTH_SERVICE_URL
curl -f $AUTH_SERVICE_URL/health

# Check network connectivity
ping auth-service
telnet auth-service 3001
```

#### 2. Authentication Issues
```bash
# Verify JWT secret matches auth service
echo $JWT_SECRET

# Test token validation
curl -H "Authorization: Bearer <token>" \
     http://localhost:4000/v1/users/profile
```

#### 3. Rate Limiting Issues
```bash
# Check Redis connection
redis-cli ping

# Reset rate limit for IP
redis-cli del "rl:general:192.168.1.1"
```

#### 4. CORS Issues
```bash
# Check browser console for CORS errors
# Verify origin is in CORS_ORIGINS config
# Test with curl (bypasses CORS)
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization" \
     -X OPTIONS http://localhost:4000/v1/users
```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run dev

# Monitor specific logs
tail -f logs/combined.log | grep "ERROR"
tail -f logs/error.log
```

### Performance Monitoring
```bash
# Monitor request metrics
curl http://localhost:4000/v1/health
# Check response times in logs

# Monitor resource usage
docker stats api-gateway
htop
```

### Log Analysis
```bash
# Find slow requests
cat logs/combined.log | grep "duration" | grep -E "[0-9]{4}ms"

# Count error rates  
cat logs/combined.log | grep "ERROR" | wc -l

# Track specific user requests
cat logs/combined.log | grep "userId.*user_123"
```

---

## Support & Contributing

For issues, questions, or contributions:
- Check the logs first: `logs/combined.log`
- Review this documentation
- Test with curl/Postman to isolate issues
- Check microservice connectivity
- Verify environment configuration

**Happy Coding! 🚀**