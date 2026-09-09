FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install
RUN cd server && npm install
COPY . .
RUN cd server && npm run build
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install --only=production
RUN cd server && npm install --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/data ./server/data
COPY --from=builder /app/premiere-panel ./premiere-panel
COPY --from=builder /app/start.js ./start.js
COPY --from=builder /app/next.config.js ./next.config.js
EXPOSE 4000
CMD ["node", "start.js"]
