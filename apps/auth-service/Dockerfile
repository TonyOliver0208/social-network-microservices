# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Copy service package files
COPY apps/auth-service/package*.json ./apps/auth-service/
COPY libs/common/package*.json ./libs/common/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/auth-service ./apps/auth-service
COPY libs/common ./libs/common

# Generate Prisma client
WORKDIR /app/apps/auth-service
RUN npx prisma generate

# Build
WORKDIR /app
RUN cd apps/auth-service && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist/apps/auth-service ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/auth-service/package*.json ./
COPY --from=builder /app/apps/auth-service/prisma ./prisma

# Expose port
EXPOSE 3001

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
