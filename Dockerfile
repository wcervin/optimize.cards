# ---------- BUILD STAGE ----------
FROM node:20-alpine AS build
WORKDIR /app
ARG APP_VERSION=unknown
ARG BUILD_TIME=unknown
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ARG APP_VERSION=unknown
ARG BUILD_TIME=unknown
ENV APP_VERSION=$APP_VERSION
ENV BUILD_TIME=$BUILD_TIME
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY server.js ./server.js
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "server.js"]
