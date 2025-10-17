# 📡 API Endpoint Reference

Base URL: `http://localhost:3000/api/v1`

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "Password123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "isVerified": false,
      "createdAt": "2025-10-14T10:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": "15m"
  },
  "message": "User registered successfully"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "isVerified": false
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": "15m"
  },
  "message": "Login successful"
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": "15m"
  },
  "message": "Token refreshed successfully"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

---

## 👤 User Endpoints

### Get User Profile
```http
GET /users/:userId
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "John Doe",
    "bio": "Software Developer",
    "avatar": "https://...",
    "website": "https://...",
    "location": "San Francisco",
    "isPrivate": false,
    "stats": {
      "followersCount": 150,
      "followingCount": 200,
      "postsCount": 50
    }
  }
}
```

### Update Profile
```http
PATCH /users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fullName": "John Doe",
  "bio": "Software Developer & Tech Enthusiast",
  "avatar": "https://...",
  "website": "https://johndoe.com",
  "location": "San Francisco, CA"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "fullName": "John Doe",
    "bio": "Software Developer & Tech Enthusiast",
    "avatar": "https://...",
    "website": "https://johndoe.com",
    "location": "San Francisco, CA",
    "updatedAt": "2025-10-14T10:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

### Follow User
```http
POST /users/:userId/follow
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Followed successfully"
}
```

### Unfollow User
```http
DELETE /users/:userId/follow
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Unfollowed successfully"
}
```

### Get Followers
```http
GET /users/:userId/followers?page=1&limit=20
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "followerId": "uuid",
      "createdAt": "2025-10-14T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Following
```http
GET /users/:userId/following?page=1&limit=20
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "followingId": "uuid",
      "createdAt": "2025-10-14T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 200,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Search Users
```http
GET /users/search?q=john&page=1&limit=20
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "uuid",
      "fullName": "John Doe",
      "avatar": "https://...",
      "bio": "Software Developer"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

## 📝 Post Endpoints (TODO)

### Create Post
```http
POST /posts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Hello World!",
  "mediaIds": ["media-uuid-1", "media-uuid-2"]
}
```

### Get Post
```http
GET /posts/:postId
Authorization: Bearer <access_token>
```

### Update Post
```http
PATCH /posts/:postId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Updated content"
}
```

### Delete Post
```http
DELETE /posts/:postId
Authorization: Bearer <access_token>
```

### Get Feed
```http
GET /posts/feed?page=1&limit=20
Authorization: Bearer <access_token>
```

### Like Post
```http
POST /posts/:postId/like
Authorization: Bearer <access_token>
```

### Unlike Post
```http
DELETE /posts/:postId/like
Authorization: Bearer <access_token>
```

### Get Post Likes
```http
GET /posts/:postId/likes?page=1&limit=20
Authorization: Bearer <access_token>
```

---

## 💬 Comment Endpoints (TODO)

### Create Comment
```http
POST /posts/:postId/comments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Great post!",
  "parentId": null
}
```

### Get Comments
```http
GET /posts/:postId/comments?page=1&limit=20
Authorization: Bearer <access_token>
```

### Update Comment
```http
PATCH /comments/:commentId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Updated comment"
}
```

### Delete Comment
```http
DELETE /comments/:commentId
Authorization: Bearer <access_token>
```

---

## 📸 Media Endpoints (TODO)

### Upload Media
```http
POST /media/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

files: [File, File, ...]
```

**Response (201):**
```json
{
  "success": true,
  "media": [
    {
      "mediaId": "uuid",
      "url": "https://res.cloudinary.com/...",
      "resourceType": "image"
    }
  ],
  "message": "Uploaded 2 media file(s) successfully"
}
```

### Get User Media
```http
GET /media?page=1&limit=20
Authorization: Bearer <access_token>
```

### Delete Media
```http
DELETE /media/:mediaId
Authorization: Bearer <access_token>
```

---

## 🔍 Search Endpoints (TODO)

### Search Posts
```http
GET /search/posts?q=javascript&page=1&limit=20
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "results": [
    {
      "postId": "uuid",
      "userId": "uuid",
      "content": "Learning JavaScript is fun!",
      "createdAt": "2025-10-14T10:00:00.000Z"
    }
  ],
  "message": "Search completed"
}
```

### Search Users
```http
GET /search/users?q=john&page=1&limit=20
Authorization: Bearer <access_token>
```

---

## ❌ Error Responses

### 400 Bad Request
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

### 401 Unauthorized
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "timestamp": "2025-10-14T10:00:00.000Z",
  "path": "/api/v1/auth/login"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied",
  "error": "Forbidden",
  "timestamp": "2025-10-14T10:00:00.000Z",
  "path": "/api/v1/posts/123/delete"
}
```

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found",
  "timestamp": "2025-10-14T10:00:00.000Z",
  "path": "/api/v1/users/invalid-id"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests",
  "timestamp": "2025-10-14T10:00:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error",
  "timestamp": "2025-10-14T10:00:00.000Z",
  "path": "/api/v1/posts"
}
```

---

## 📊 Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Window**: 60 seconds
- **Header**: `X-RateLimit-Remaining`

---

## 🔑 Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

**Token Expiration:**
- Access Token: 15 minutes
- Refresh Token: 7 days

**Token Refresh:**
Use the `/auth/refresh` endpoint with a valid refresh token to get a new access token.

---

## 📝 Request/Response Headers

### Common Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
X-Request-ID: <optional-unique-id>
```

### Common Response Headers
```
Content-Type: application/json
X-Request-ID: <unique-id>
X-RateLimit-Remaining: <number>
```

---

## 🧪 Testing with cURL

### Register & Login Flow
```bash
# 1. Register
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test1234!"}')

# 2. Extract access token
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.accessToken')

# 3. Use token to access protected endpoint
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Testing with Postman

1. Import the API collection
2. Set environment variable `baseUrl` = `http://localhost:3000/api/v1`
3. Set environment variable `accessToken` = `<your-token>`
4. Use `{{baseUrl}}` and `{{accessToken}}` in requests

---

**For interactive API documentation, visit: http://localhost:3000/api/docs** 🚀
