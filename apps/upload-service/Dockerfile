FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Copy service package files
COPY apps/upload-service/package*.json ./apps/upload-service/
COPY libs/common/package*.json ./libs/common/

# Install dependencies
RUN npm install

# Copy source code
COPY apps/upload-service ./apps/upload-service
COPY libs/common ./libs/common

# Generate Prisma Client
WORKDIR /app/apps/upload-service
RUN npx prisma generate

# Build the application
WORKDIR /app
RUN npm run build:upload

FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/common ./node_modules/@app/common
COPY --from=builder /app/apps/upload-service/package*.json ./
COPY --from=builder /app/apps/upload-service/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3008

CMD ["node", "dist/apps/upload-service/main.js"]
