# gRPC Error Handling Guide

## Overview

All microservices now implement proper gRPC error handling with specific status codes that map correctly to HTTP status codes at the API Gateway.

## Implementation Pattern

### Services Layer (User/Post/Media/Search)

```typescript
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

// In controller methods:
if (!result.success) {
  const grpcCode = this.getGrpcStatusCode(result.error, result.statusCode);
  throw new RpcException({
    code: grpcCode,
    message: result.error,
  });
}
```

### Error Code Mapping

| Error Type | gRPC Code | HTTP Status | Example Messages |
|------------|-----------|-------------|------------------|
| Already Exists | `ALREADY_EXISTS (6)` | 409 Conflict | "Email already exists", "Already following user" |
| Not Found | `NOT_FOUND (5)` | 404 Not Found | "User not found", "Post not found" |
| Unauthorized | `UNAUTHENTICATED (16)` | 401 Unauthorized | "Invalid credentials", "Token expired" |
| Forbidden | `PERMISSION_DENIED (7)` | 403 Forbidden | "You can only update your own posts" |
| Bad Request | `INVALID_ARGUMENT (3)` | 400 Bad Request | "Invalid input", "Validation failed" |
| Rate Limited | `RESOURCE_EXHAUSTED (14)` | 429 Too Many Requests | "Quota exceeded", "Rate limit reached" |
| Timeout | `DEADLINE_EXCEEDED (4)` | 504 Gateway Timeout | "Request timeout" |
| Unknown | `UNKNOWN (2)` | 500 Internal Error | Unexpected errors |

## Service-Specific Error Patterns

### Auth Service

```typescript
// Email already exists
throw new RpcException({
  code: GrpcStatus.ALREADY_EXISTS,
  message: 'Email already exists',
});

// Invalid credentials
throw new RpcException({
  code: GrpcStatus.UNAUTHENTICATED,
  message: 'Invalid credentials',
});
```

### User Service

```typescript
// Profile not found
throw new RpcException({
  code: GrpcStatus.NOT_FOUND,
  message: 'Profile not found',
});

// Cannot follow yourself
throw new RpcException({
  code: GrpcStatus.PERMISSION_DENIED,
  message: 'You cannot follow yourself',
});
```

### Post Service

```typescript
// Post not found
throw new RpcException({
  code: GrpcStatus.NOT_FOUND,
  message: 'Post not found',
});

// Not your post
throw new RpcException({
  code: GrpcStatus.PERMISSION_DENIED,
  message: 'You can only update your own posts',
});
```

### Media Service

```typescript
// File too large
throw new RpcException({
  code: GrpcStatus.INVALID_ARGUMENT,
  message: 'File size exceeds maximum allowed',
});

// Quota exceeded
throw new RpcException({
  code: GrpcStatus.RESOURCE_EXHAUSTED,
  message: 'Storage quota exceeded',
});
```

### Search Service

```typescript
// Query too short
throw new RpcException({
  code: GrpcStatus.INVALID_ARGUMENT,
  message: 'Search query must be at least 3 characters',
});

// Search timeout
throw new RpcException({
  code: GrpcStatus.DEADLINE_EXCEEDED,
  message: 'Search request timed out',
});
```

## API Gateway Integration

The API Gateway automatically maps gRPC status codes to HTTP status codes using the `getHttpStatusFromGrpcError()` method in `auth.controller.ts`:

```typescript
private getHttpStatusFromGrpcError(error: any): number {
  const grpcCode = error.code;
  
  switch (grpcCode) {
    case 6: // ALREADY_EXISTS
      return HttpStatus.CONFLICT; // 409
    case 5: // NOT_FOUND
      return HttpStatus.NOT_FOUND; // 404
    case 16: // UNAUTHENTICATED
      return HttpStatus.UNAUTHORIZED; // 401
    case 7: // PERMISSION_DENIED
      return HttpStatus.FORBIDDEN; // 403
    case 3: // INVALID_ARGUMENT
      return HttpStatus.BAD_REQUEST; // 400
    case 14: // RESOURCE_EXHAUSTED
      return HttpStatus.TOO_MANY_REQUESTS; // 429
    case 4: // DEADLINE_EXCEEDED
      return HttpStatus.GATEWAY_TIMEOUT; // 504
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR; // 500
  }
}
```

## Testing Error Responses

### Example: Duplicate Email Registration

**Request:**
```bash
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "existing@example.com",
  "password": "password123",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Email already exists",
  "timestamp": "2025-10-23T02:51:50.677Z",
  "path": "/api/v1/auth/register",
  "method": "POST"
}
```

### Example: User Not Found

**Request:**
```bash
GET http://localhost:3000/api/v1/users/invalid-uuid
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Profile not found",
  "timestamp": "2025-10-23T03:00:00.000Z",
  "path": "/api/v1/users/invalid-uuid",
  "method": "GET"
}
```

## Benefits

✅ **Clear Error Messages**: Users receive specific, actionable error messages  
✅ **Proper HTTP Status Codes**: RESTful APIs return semantically correct status codes  
✅ **Consistent Error Handling**: All services follow the same pattern  
✅ **Better Debugging**: Easier to trace errors through microservices  
✅ **Type Safety**: TypeScript ensures errors are properly structured  

## Best Practices

1. **Always use specific error codes** - Don't default to UNKNOWN unless truly unexpected
2. **Include helpful messages** - Tell users what went wrong and potentially how to fix it
3. **Log errors at service level** - Use Logger to track errors before throwing
4. **Map domain errors to gRPC codes** - Think about what the error means semantically
5. **Test error scenarios** - Ensure errors propagate correctly through the stack

## References

- [gRPC Status Codes](https://grpc.io/docs/guides/error/)
- [NestJS Microservices Exception Filters](https://docs.nestjs.com/microservices/exception-filters)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
