FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

COPY package*.json ./
COPY apps/post-service/package*.json ./apps/post-service/
COPY libs/common/package*.json ./libs/common/

RUN npm ci

COPY . .
COPY apps/post-service/prisma ./apps/post-service/prisma

RUN cd apps/post-service && npx prisma generate
RUN npm run build:post

FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/common ./node_modules/@app/common
COPY --from=builder /app/proto ./proto
COPY --from=builder /app/apps/post-service/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/post-service/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 3003

CMD ["node", "dist/apps/post-service/main.js"]
