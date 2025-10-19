# Proto Code Generation Guide

## Overview

This project uses **Protocol Buffers (gRPC)** for microservice communication. TypeScript interfaces are automatically generated from `.proto` files using a custom lightweight generator.

---

## Quick Start

```bash
# Generate TypeScript code from proto files
npm run proto:gen
```

---

## How It Works

### 1. Define Service in Proto Files

Edit files in `proto/` directory:

```protobuf
// proto/auth.proto
syntax = "proto3";
package auth;

service AuthService {
  rpc Login(LoginRequest) returns (AuthResponse);
}

message LoginRequest {
  string email = 1;
  string password = 2;
}

message AuthResponse {
  string accessToken = 1;
  string refreshToken = 2;
}
```

### 2. Generate TypeScript Code

```bash
npm run proto:gen
```

Generates `generated/auth.ts`:

```typescript
export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthService {
  Login(request: LoginRequest): Observable<AuthResponse>;
}

export const AUTHSERVICE_SERVICE_NAME = 'AuthService';
```

### 3. Use in Your Code

```typescript
import { AuthService, AUTHSERVICE_SERVICE_NAME } from '@app/proto/auth';

export class AuthController implements OnModuleInit {
  private authService: AuthService;

  onModuleInit() {
    this.authService = this.client.getService<AuthService>(AUTHSERVICE_SERVICE_NAME);
  }

  async login(dto: LoginDto) {
    return await lastValueFrom(this.authService.Login(dto));
  }
}
```

---

## Directory Structure

```
proto/                          # Source .proto files
  ├── auth.proto
  ├── user.proto
  ├── post.proto
  ├── media.proto
  └── search.proto

generated/                      # Auto-generated (DO NOT EDIT)
  ├── auth.ts
  ├── user.ts
  ├── post.ts
  ├── media.ts
  ├── search.ts
  └── index.ts                  # Barrel export

bin/
  └── proto-gen.cjs             # Generator script
```

---

## Import Patterns

```typescript
// Import from specific file
import { AuthService, LoginRequest, AUTHSERVICE_SERVICE_NAME } from '@app/proto/auth';
import { UserService, USERSERVICE_SERVICE_NAME } from '@app/proto/user';

// Import from barrel export
import { AuthService, UserService, PostService } from '@app/proto';
```

---

## Generator Features

Our custom proto generator (`bin/proto-gen.cjs`):

✅ **Zero Dependencies** - No external tools required  
✅ **Works Everywhere** - No file path issues  
✅ **Fast** - Generates in ~50ms  
✅ **Type-Safe** - Full TypeScript support  
✅ **Simple** - Easy to customize  

### Why Custom Generator?

We **don't** use `protoc` or `ts-proto` because:
- ❌ Requires external compiler installation
- ❌ Fails with spaces in file paths
- ❌ Complex setup and dependencies
- ❌ Slower execution

Our generator:
- ✅ Pure Node.js (~200 lines)
- ✅ Zero external dependencies
- ✅ Works on any machine immediately
- ✅ Generates exactly what we need

---

## Common Tasks

### Add New Service

1. Create `proto/myservice.proto`
2. Define service and messages
3. Run `npm run proto:gen`
4. Import: `import { MyService, MYSERVICE_SERVICE_NAME } from '@app/proto/myservice'`

### Add New Method

1. Edit `.proto` file
2. Add RPC method
3. Run `npm run proto:gen`
4. Use new method with full type safety

### Update Message

1. Edit message in `.proto` file
2. Run `npm run proto:gen`
3. Fix any TypeScript errors (type mismatches caught at compile time)

---

## Usage Examples

### API Gateway Controller

```typescript
import { PostService, POSTSERVICE_SERVICE_NAME, CreatePostRequest } from '@app/proto/post';

export class PostController implements OnModuleInit {
  private postService: PostService;

  constructor(@Inject(SERVICES.POST_SERVICE) private client: ClientGrpc) {}

  onModuleInit() {
    this.postService = this.client.getService<PostService>(POSTSERVICE_SERVICE_NAME);
  }

  async createPost(userId: string, dto: CreatePostDto) {
    return await lastValueFrom(
      this.postService.CreatePost({ userId, ...dto })
    );
  }
}
```

### Microservice Handler (Future)

```typescript
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AUTHSERVICE_SERVICE_NAME, LoginRequest, AuthResponse } from '@app/proto/auth';

@Controller()
export class AuthController {
  @GrpcMethod(AUTHSERVICE_SERVICE_NAME, 'Login')
  async login(request: LoginRequest): Promise<AuthResponse> {
    // Full type safety for request and response
    return {
      accessToken: 'token',
      refreshToken: 'refresh',
    };
  }
}
```

---

## Benefits

✅ **Type Safety** - Compile-time type checking  
✅ **No Typos** - Constants for service names  
✅ **IntelliSense** - Full IDE auto-completion  
✅ **Single Source of Truth** - Proto defines everything  
✅ **Easy Refactoring** - Change proto → regenerate → fix errors  
✅ **No Manual Sync** - Generated code always matches proto  

---

## Troubleshooting

### Types not found

Restart TypeScript server:
```
CMD/CTRL + Shift + P → "TypeScript: Restart TS Server"
```

### Import errors

Check `tsconfig.json` has path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@app/proto": ["generated"],
      "@app/proto/*": ["generated/*"]
    }
  }
}
```

### Generation fails

Check proto syntax:
- Must have: `syntax = "proto3";`
- Valid message definitions
- Valid service definitions

---

## Generated Code Example

From `proto/auth.proto`:

```protobuf
service AuthService {
  rpc Login(LoginRequest) returns (AuthResponse);
  rpc Register(RegisterRequest) returns (AuthResponse);
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
}

message LoginRequest {
  string email = 1;
  string password = 2;
}
```

Generates `generated/auth.ts`:

```typescript
/* eslint-disable */
/**
 * Auto-generated from auth.proto
 * DO NOT EDIT MANUALLY
 */
import { Observable } from 'rxjs';

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

export interface AuthService {
  Login(request: LoginRequest): Observable<AuthResponse>;
  Register(request: RegisterRequest): Observable<AuthResponse>;
  ValidateToken(request: ValidateTokenRequest): Observable<ValidateTokenResponse>;
}

export const AUTHSERVICE_SERVICE_NAME = 'AuthService';
```

---

## Workflow Summary

```
1. Edit proto file → 2. Run npm run proto:gen → 3. Use generated types → 4. Enjoy type safety! 🎉
```

**Note:** Never edit files in `generated/` - they are overwritten on each generation.
