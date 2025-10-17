# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api-gateway/package*.json ./apps/api-gateway/
COPY libs/common/package*.json ./libs/common/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN cd apps/api-gateway && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist/apps/api-gateway ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/package*.json ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
