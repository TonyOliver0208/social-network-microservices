# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Copy service package files
COPY apps/auth-service/package*.json ./apps/auth-service/
COPY libs/common/package*.json ./libs/common/

# Install dependencies
RUN npm install

# Copy proto files and generated code
COPY proto ./proto
COPY generated ./generated
COPY bin ./bin

# Copy source code
COPY apps/auth-service ./apps/auth-service
COPY libs/common ./libs/common

# Generate Prisma client
WORKDIR /app/apps/auth-service
RUN npx prisma generate

# Build
WORKDIR /app
RUN npm run build:auth

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/common ./node_modules/@app/common
COPY --from=builder /app/proto ./proto
COPY --from=builder /app/apps/auth-service/package*.json ./
COPY --from=builder /app/apps/auth-service/prisma ./prisma

# Expose port
EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/apps/auth-service/main.js"]
