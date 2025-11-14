# Complete Service Refactoring Guide

## ✅ Completed Services

### 1. Post Service
- ✅ Split into 5 logic services (post, like, comment, tag, vote)
- ✅ Created view service for formatting
- ✅ Separated public and protected controllers
- ✅ Updated module with all providers

### 2. User Service  
- ✅ Split into 2 logic services (profile, follow)
- ✅ Separated public and protected controllers
- ✅ Updated app.module.ts

## 📋 Template for Remaining Services

### Quick Refactor Steps:

```bash
# 1. Create folder structure
cd apps/SERVICE-NAME/src/SERVICE
mkdir -p controllers services/logic services/view

# 2. Create logic services (one per domain)
# Example: auth-logic.service.ts, token-logic.service.ts

# 3. Create controllers
# - SERVICE-public.controller.ts (no auth)
# - SERVICE-protected.controller.ts (auth required)

# 4. Update module/app.module.ts
# - Import new controllers
# - Import new services
# - Update providers array
```

## 🎯 Service-Specific Guides

### Auth Service

**Logic Services:**
```typescript
// auth-logic.service.ts - Login, register, validation
// token-logic.service.ts - JWT generation/validation
// oauth-logic.service.ts - Google, GitHub OAuth
```

**Controllers:**
```typescript
// auth-public.controller.ts
- Register
- Login
- OAuth callbacks

// auth-protected.controller.ts
- Refresh token
- Logout
- Validate token
```

**Quick Commands:**
```bash
cd apps/auth-service/src/auth
mkdir -p controllers services/logic

# Create logic services
touch services/logic/auth-logic.service.ts
touch services/logic/token-logic.service.ts
touch services/logic/oauth-logic.service.ts

# Create controllers
touch controllers/auth-public.controller.ts
touch controllers/auth-protected.controller.ts
```

### Media Service

**Logic Services:**
```typescript
// upload-logic.service.ts - Handle file uploads
// media-logic.service.ts - CRUD operations
// cloudinary-logic.service.ts - Cloudinary integration
```

**View Services:**
```typescript
// media-view.service.ts - URL generation, formatting
```

### Search Service

**Logic Services:**
```typescript
// search-logic.service.ts - Search logic
// index-logic.service.ts - Indexing logic
```

### Design Service

**Logic Services:**
```typescript
// design-logic.service.ts - Design CRUD
// template-logic.service.ts - Template management
```

## 📝 Code Templates

### Logic Service Template

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ExampleLogicService {
  private readonly logger = new Logger(ExampleLogicService.name);

  constructor(private readonly prisma: PrismaService) {}

  async exampleMethod(params: any) {
    try {
      // Logic here
      this.logger.log('Operation successful');
      return { success: true, data: result };
    } catch (error) {
      this.logger.error(`Error: ${error.message}`);
      throw error;
    }
  }
}
```

### Controller Template

```typescript
import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ExampleLogicService } from '../services/logic/example-logic.service';
import { SERVICE_NAME } from '@app/proto/service';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Controller()
export class ExamplePublicController {
  private readonly logger = new Logger(ExamplePublicController.name);

  constructor(private readonly exampleLogic: ExampleLogicService) {}

  @GrpcMethod(SERVICE_NAME, 'MethodName')
  async methodName(data: any) {
    try {
      this.logger.log(`Processing request`);
      return await this.exampleLogic.methodName(data);
    } catch (error) {
      throw this.handleException(error);
    }
  }

  private handleException(error: any): RpcException {
    return new RpcException({
      code: GrpcStatus.UNKNOWN,
      message: error.message || 'Internal server error',
    });
  }
}
```

## 🔍 Verification Checklist

After refactoring each service:

- [ ] No TypeScript errors (`npm run lint`)
- [ ] All imports updated
- [ ] Module/AppModule updated with new providers
- [ ] Controllers registered
- [ ] Services injected properly
- [ ] gRPC methods working
- [ ] Event patterns working
- [ ] Dependencies resolved

## 🚀 Testing After Refactor

```bash
# 1. Build the service
cd apps/SERVICE-NAME
npm run build

# 2. Run the service
npm run start:dev

# 3. Test gRPC endpoints
# Use your API gateway or gRPC client

# 4. Check logs
# Verify no errors in startup
# Check gRPC connections
```

## 📊 Benefits Achieved

### Code Organization
- **Before**: Single 1000+ line file
- **After**: Multiple 100-300 line files

### Maintainability
- **Before**: Hard to find specific logic
- **After**: Clear separation by domain

### Testability
- **Before**: Hard to mock dependencies
- **After**: Easy to test individual services

### Team Collaboration
- **Before**: Merge conflicts common
- **After**: Work on different files simultaneously

## 🎉 Summary

### Completed:
1. ✅ Post Service (1184 lines → 6 files)
2. ✅ User Service (325 lines → 4 files)

### Remaining:
3. ⏳ Auth Service
4. ⏳ Media Service
5. ⏳ Search Service
6. ⏳ Design Service  
7. ⏳ Subscription Service
8. ⏳ Upload Service

### Time Estimate:
- Simple services (Search, Design): 15-20 min each
- Medium services (Media, Subscription): 30-40 min each
- Complex services (Auth, Upload): 45-60 min each

## 💡 Pro Tips

1. **Start Small**: Begin with simplest service (Design or Search)
2. **Test Often**: Run service after each major change
3. **Keep Original**: Don't delete old files until new structure works
4. **Use Templates**: Copy from completed services
5. **Check Dependencies**: Update imports carefully

## 🆘 Troubleshooting

### "Cannot find module" errors
```bash
# Check import paths - should use relative imports
// ✅ Correct
import { Service } from '../services/logic/service';

// ❌ Wrong  
import { Service } from 'services/logic/service';
```

### "Circular dependency" warnings
- Move shared types to separate file
- Use `forwardRef()` if needed
- Restructure dependencies

### gRPC method not found
- Check `@GrpcMethod` decorator
- Verify service name matches proto
- Check method name casing

## 📞 Next Steps

1. Choose next service to refactor (recommend Search or Design)
2. Follow the template above
3. Test thoroughly
4. Move to next service

Good luck! 🚀
