FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Copy libs and app
COPY libs ./libs
COPY apps/design-service ./apps/design-service

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN cd apps/design-service && npx prisma generate

# Build the application
RUN npm run build design-service

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/design-service/package.json ./apps/design-service/

# Install production dependencies only
RUN npm install --only=production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/design-service/prisma ./apps/design-service/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENV NODE_ENV=production

EXPOSE 3006

CMD ["node", "dist/apps/design-service/main.js"]
