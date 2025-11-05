FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Copy service package files
COPY apps/post-service/package*.json ./apps/post-service/
COPY libs/common/package*.json ./libs/common/

# Install dependencies
RUN npm install

# Copy proto files and generated code
COPY proto ./proto
COPY generated ./generated
COPY bin ./bin

# Copy source code
COPY apps/post-service ./apps/post-service
COPY libs/common ./libs/common

# Generate Prisma client
WORKDIR /app/apps/post-service
RUN npx prisma generate

# Build
WORKDIR /app
RUN npm run build:post

FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/common ./node_modules/@app/common
COPY --from=builder /app/proto ./proto
COPY --from=builder /app/apps/post-service/package*.json ./
COPY --from=builder /app/apps/post-service/prisma ./prisma

# Expose port
EXPOSE 50053

# Start the application
CMD ["node", "dist/apps/post-service/main.js"]
