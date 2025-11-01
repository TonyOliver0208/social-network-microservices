FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

COPY libs ./libs
COPY apps/upload-service ./apps/upload-service

RUN npm install

RUN cd apps/upload-service && npx prisma generate

RUN npm run build upload-service

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/upload-service/package.json ./apps/upload-service/

RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/upload-service/prisma ./apps/upload-service/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

ENV NODE_ENV=production

EXPOSE 3008

CMD ["node", "dist/apps/upload-service/main.js"]
