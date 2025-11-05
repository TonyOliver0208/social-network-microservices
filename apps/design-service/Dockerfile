FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Copy service package files
COPY apps/design-service/package*.json ./apps/design-service/
COPY libs/common/package*.json ./libs/common/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/design-service ./apps/design-service
COPY libs/common ./libs/common

# Generate Prisma Client
WORKDIR /app/apps/design-service
RUN npx prisma generate

# Build the application
WORKDIR /app
RUN npm run build:design

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/common ./node_modules/@app/common
COPY --from=builder /app/apps/design-service/package*.json ./
COPY --from=builder /app/apps/design-service/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3006

CMD ["node", "dist/apps/design-service/main.js"]
