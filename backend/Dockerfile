FROM node:20 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/
# Required by npm workspaces + lockfile; -w below does not install its deps
COPY frontend/package.json ./frontend/

RUN npm ci -w @remnant/shared -w backendts

COPY packages/shared ./packages/shared
COPY backend ./backend

RUN npm run build -w @remnant/shared && npm run build -w backendts

# Bare `npm prune --omit=dev` reinstalls ALL workspaces (incl. React) — use -w
RUN rm -rf node_modules \
  && npm ci --omit=dev -w @remnant/shared -w backendts

FROM node:20-slim
WORKDIR /app

COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY backend/src/utils/fonts ./backend/dist/utils/fonts
COPY backend/src/utils/invoice ./backend/dist/utils/invoice

WORKDIR /app/backend
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
