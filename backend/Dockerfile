FROM node:20 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci

COPY packages/shared ./packages/shared
COPY backend ./backend

RUN npm run build -w @remnant/shared && npm run build -w backendts

FROM node:20
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/backend/dist ./backend/dist
COPY backend/src/utils/fonts ./backend/dist/utils/fonts
COPY backend/src/utils/invoice ./backend/dist/utils/invoice

WORKDIR /app/backend
CMD ["npm", "start"]
