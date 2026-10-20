# ==========================================
# Stage 1: Install dependencies
# ==========================================
FROM node:20-alpine AS deps

WORKDIR /app

# libc6-compat may be needed for certain alpine packages
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci || npm install

# ==========================================
# Stage 2: Build Next.js application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build arguments for client-side environment variables
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:5001/api/v1
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ==========================================
# Stage 3: Production runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache curl

# Security: run as unprivileged user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Setup cache directory with non-root ownership
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy public folder and standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
