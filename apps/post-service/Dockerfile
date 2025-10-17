FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/post-service/package*.json ./apps/post-service/
COPY libs/common/package*.json ./libs/common/

RUN npm ci

COPY . .
COPY apps/post-service/prisma ./apps/post-service/prisma

RUN cd apps/post-service && npx prisma generate
RUN npm run build post-service

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist/apps/post-service ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/post-service/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 3003

CMD ["node", "dist/main.js"]
