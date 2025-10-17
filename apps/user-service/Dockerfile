# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Copy service package files
COPY apps/user-service/package*.json ./apps/user-service/
COPY libs/common/package*.json ./libs/common/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/user-service ./apps/user-service
COPY libs/common ./libs/common

# Generate Prisma client
WORKDIR /app/apps/user-service
RUN npx prisma generate

# Build
WORKDIR /app
RUN cd apps/user-service && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist/apps/user-service ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/user-service/package*.json ./
COPY --from=builder /app/apps/user-service/prisma ./prisma

# Expose port
EXPOSE 3002

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
