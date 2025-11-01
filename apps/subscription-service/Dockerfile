FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

COPY libs ./libs
COPY apps/subscription-service ./apps/subscription-service

RUN npm install

RUN cd apps/subscription-service && npx prisma generate

RUN npm run build subscription-service

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/subscription-service/package.json ./apps/subscription-service/

RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/subscription-service/prisma ./apps/subscription-service/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENV NODE_ENV=production

EXPOSE 3007

CMD ["node", "dist/apps/subscription-service/main.js"]
