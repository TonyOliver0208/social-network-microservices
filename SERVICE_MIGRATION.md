# 🎨 Service Migration to NestJS + Prisma + PostgreSQL

## Overview

This document outlines the migration of three Express.js services to NestJS with Prisma ORM and PostgreSQL, following enterprise-level conventions and the existing codebase architecture.

## Migrated Services

### 1. 🎨 **Design Service** (Port: 3006)
- **Purpose**: Manage user design projects (Canvas-based editor)
- **Database**: PostgreSQL (`devcoll_design`)
- **Tech Stack**: NestJS + Prisma + PostgreSQL
- **Key Features**:
  - Create, read, update, delete designs
  - Store canvas data (JSON)
  - Design categorization
  - User ownership validation

**Endpoints**:
```
GET    /designs           - Get all user designs
GET    /designs/:id       - Get specific design
POST   /designs           - Create new design
PUT    /designs/:id       - Update design
DELETE /designs/:id       - Delete design
```

### 2. 💳 **Subscription Service** (Port: 3007)
- **Purpose**: Handle premium subscriptions and payments
- **Database**: PostgreSQL (`devcoll_subscription`)
- **Tech Stack**: NestJS + Prisma + PostgreSQL
- **Key Features**:
  - Subscription status management
  - Premium upgrade/cancellation
  - Payment tracking
  - Transaction history

**Endpoints**:
```
GET    /subscriptions              - Get subscription status
POST   /subscriptions/upgrade      - Upgrade to premium
POST   /subscriptions/cancel       - Cancel premium
POST   /subscriptions/payments     - Create payment
GET    /subscriptions/payments     - Get payment history
PATCH  /subscriptions/payments/:id/status - Update payment status
```

### 3. 📤 **Upload Service** (Port: 3008)
- **Purpose**: File uploads and AI image generation
- **Database**: PostgreSQL (`devcoll_upload`)
- **Tech Stack**: NestJS + Prisma + PostgreSQL + Cloudinary
- **Key Features**:
  - File upload to Cloudinary
  - Media management
  - AI image generation (placeholder for DALL-E integration)
  - Media categorization (IMAGE, VIDEO, DOCUMENT, AUDIO, OTHER)

**Endpoints**:
```
POST   /upload/media              - Upload media file
GET    /upload/media              - Get all user media
DELETE /upload/media/:id          - Delete media
POST   /upload/ai/generate-image  - Generate AI image
GET    /upload/ai/history         - Get AI generation history
```

## Architecture Patterns Used

### ✅ **Following Existing Conventions**

1. **Module Structure**:
   ```
   apps/<service-name>/
   ├── prisma/
   │   └── schema.prisma
   ├── src/
   │   ├── main.ts
   │   ├── app.module.ts
   │   ├── prisma/
   │   │   ├── prisma.service.ts
   │   │   └── prisma.module.ts
   │   └── <feature>/
   │       ├── <feature>.controller.ts
   │       ├── <feature>.service.ts
   │       ├── <feature>.module.ts
   │       └── dto/
   │           └── <feature>.dto.ts
   ├── Dockerfile
   ├── package.json
   └── tsconfig.app.json
   ```

2. **Prisma Client Output**: Each service has isolated Prisma client
   - `@prisma/client-design`
   - `@prisma/client-subscription`
   - `@prisma/client-upload`

3. **Authentication**: Using `@app/common` JwtAuthGuard
4. **Validation**: Class-validator + Class-transformer DTOs
5. **Documentation**: Swagger/OpenAPI auto-generated docs
6. **Error Handling**: NestJS exception filters
7. **CORS**: Configured for client integration

## Database Schema

### Design Service Schema
```prisma
model Design {
  id         String   @id @default(uuid())
  userId     String
  name       String
  canvasData String?  @db.Text
  width      Int?
  height     Int?
  category   String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Subscription Service Schema
```prisma
model Subscription {
  id           String    @id @default(uuid())
  userId       String    @unique
  isPremium    Boolean   @default(false)
  paymentId    String?
  premiumSince DateTime?
  expiresAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Payment {
  id              String        @id @default(uuid())
  userId          String
  subscriptionId  String?
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("USD")
  status          PaymentStatus @default(PENDING)
  paymentMethod   String
  transactionId   String?       @unique
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

### Upload Service Schema
```prisma
model Media {
  id            String        @id @default(uuid())
  userId        String
  name          String
  cloudinaryId  String        @unique
  url           String
  mimeType      String
  size          Int
  width         Int?
  height        Int?
  category      MediaCategory @default(IMAGE)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model AIGeneratedImage {
  id             String   @id @default(uuid())
  userId         String
  prompt         String   @db.Text
  negativePrompt String?  @db.Text
  style          String?
  imageUrl       String
  cloudinaryId   String?  @unique
  model          String   @default("dall-e-3")
  createdAt      DateTime @default(now())
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
# From root directory
npm install

# Install service-specific dependencies
cd apps/design-service && npm install
cd apps/subscription-service && npm install
cd apps/upload-service && npm install
```

### 2. Configure Environment Variables
Add to your `.env` file:
```env
# Design Service
DESIGN_DATABASE_URL=postgresql://postgres:password@localhost:5436/devcoll_design?schema=public

# Subscription Service
SUBSCRIPTION_DATABASE_URL=postgresql://postgres:password@localhost:5437/devcoll_subscription?schema=public

# Upload Service
UPLOAD_DATABASE_URL=postgresql://postgres:password@localhost:5438/devcoll_upload?schema=public

# Cloudinary (for upload service)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional: OpenAI for AI image generation
OPENAI_API_KEY=your_openai_key
```

### 3. Run Prisma Migrations
```bash
# Design Service
cd apps/design-service
npx prisma generate
npx prisma migrate dev --name init

# Subscription Service
cd apps/subscription-service
npx prisma generate
npx prisma migrate dev --name init

# Upload Service
cd apps/upload-service
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run Services

**Development Mode:**
```bash
# Individual services
npm run start:dev design-service
npm run start:dev subscription-service
npm run start:dev upload-service

# Or all services with Docker
docker-compose up -d
```

**Production Mode:**
```bash
# Build
npm run build design-service
npm run build subscription-service
npm run build upload-service

# Start
npm run start:prod design-service
npm run start:prod subscription-service
npm run start:prod upload-service
```

### 5. Access API Documentation
Once services are running:
- Design Service: http://localhost:3006/api/docs
- Subscription Service: http://localhost:3007/api/docs
- Upload Service: http://localhost:3008/api/docs

## Migration Benefits

### ✅ **Improvements Over Express Version**

1. **Type Safety**: End-to-end TypeScript with Prisma-generated types
2. **Better Architecture**: Dependency injection, modular design
3. **Auto-generated API Docs**: Swagger documentation out-of-the-box
4. **Validation**: Built-in request/response validation with decorators
5. **Error Handling**: Consistent error responses
6. **Testing**: Better testability with NestJS testing utilities
7. **Scalability**: Easy to add features and scale services
8. **Database Migrations**: Prisma migrations for version control
9. **Query Builder**: Type-safe database queries with Prisma
10. **Performance**: Connection pooling, caching support

## Docker Configuration

All services are containerized and configured in `docker-compose.yml`:

```yaml
services:
  postgres-design:
    image: postgres:15-alpine
    ports: ["5436:5432"]
  
  postgres-subscription:
    image: postgres:15-alpine
    ports: ["5437:5432"]
  
  postgres-upload:
    image: postgres:15-alpine
    ports: ["5438:5432"]
  
  design-service:
    build: ./apps/design-service
    ports: ["3006:3006"]
    depends_on: [postgres-design]
  
  subscription-service:
    build: ./apps/subscription-service
    ports: ["3007:3007"]
    depends_on: [postgres-subscription]
  
  upload-service:
    build: ./apps/upload-service
    ports: ["3008:3008"]
    depends_on: [postgres-upload]
```

## Integration with API Gateway

Update API Gateway to proxy these services:

```typescript
// apps/api-gateway/src/app.module.ts
@Module({
  imports: [
    // ... existing imports
    DesignModule,
    SubscriptionModule,
    UploadModule,
  ],
})
```

## Testing

```bash
# Unit tests
npm run test design-service
npm run test subscription-service
npm run test upload-service

# E2E tests
npm run test:e2e design-service
npm run test:e2e subscription-service
npm run test:e2e upload-service

# Test coverage
npm run test:cov design-service
```

## Next Steps

### 🔮 **Future Enhancements**

1. **Design Service**:
   - Add design templates
   - Version control for designs
   - Collaborative editing
   - Export functionality (PNG, SVG, PDF)

2. **Subscription Service**:
   - Integrate Stripe/PayPal
   - Recurring billing
   - Subscription tiers
   - Usage-based billing

3. **Upload Service**:
   - Integrate OpenAI DALL-E API
   - Image optimization
   - Video transcoding
   - CDN integration
   - Thumbnail generation

## Troubleshooting

### Common Issues:

1. **Prisma Client not found**: Run `npx prisma generate`
2. **Database connection errors**: Check DATABASE_URL in `.env`
3. **Port conflicts**: Ensure ports 3006-3008 and 5436-5438 are available
4. **Cloudinary errors**: Verify API credentials in `.env`

## Contributors

- Tony Oliver - Initial migration and architecture

## License

MIT

---

**Migration Date**: October 25, 2025
**Status**: ✅ Complete
