# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Copy service package files
COPY apps/api-gateway/package*.json ./apps/api-gateway/
COPY libs/common/package*.json ./libs/common/

# Install dependencies
RUN npm install

# Copy proto files and generated code
COPY proto ./proto
COPY generated ./generated
COPY bin ./bin

# Copy source code
COPY apps/api-gateway ./apps/api-gateway
COPY libs/common ./libs/common

# Build the application
RUN npm run build:gateway

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/common ./node_modules/@app/common
COPY --from=builder /app/proto ./proto
COPY --from=builder /app/apps/api-gateway/package*.json ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/apps/api-gateway/main.js"]
