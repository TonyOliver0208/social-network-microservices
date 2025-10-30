FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS dependencies
COPY package*.json ./
COPY apps/media-service/package*.json ./apps/media-service/
COPY libs/common/package*.json ./libs/common/
RUN npm ci --only=production

# Build stage
FROM base AS build
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./
COPY proto ./proto
COPY generated ./generated
COPY bin ./bin
COPY apps/media-service ./apps/media-service
COPY libs/common ./libs/common
RUN npm ci
RUN npm run build:media

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/libs/common ./node_modules/@app/common
COPY --from=build /app/proto ./proto
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN mkdir -p /app/uploads
EXPOSE 3004
CMD ["node", "dist/apps/media-service/main.js"]
