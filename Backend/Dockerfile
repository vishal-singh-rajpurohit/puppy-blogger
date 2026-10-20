# ==========================================
# Stage 1: Build TypeScript backend
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install native compilation dependencies (needed for packages like bcrypt)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci || npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Remove development dependencies to keep final image slim
RUN npm prune --omit=dev

# ==========================================
# Stage 2: Minimal Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Install curl for health checking
RUN apk add --no-cache curl

# Run as non-root user
USER node

# Copy pruned dependencies and built javascript
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5001/ || exit 1

CMD ["node", "dist/server.js"]
