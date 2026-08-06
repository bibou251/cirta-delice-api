# ═══════════════════════════════════════════════════════════════════════════
# Stage 1: Builder — compile TypeScript → JavaScript
# ═══════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les manifestes en premier pour profiter du cache Docker layer
COPY package*.json ./
RUN npm ci --include=dev --frozen-lockfile

# Copier le source et compiler
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ═══════════════════════════════════════════════════════════════════════════
# Stage 2: Production runner — image finale légère
# ═══════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

# Sécurité : user non-root
RUN addgroup -S cirta && adduser -S cirta -G cirta

WORKDIR /app

# Copier uniquement ce qui est nécessaire en production
COPY package*.json ./
RUN npm ci --omit=dev --frozen-lockfile && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Changer le propriétaire des fichiers
RUN chown -R cirta:cirta /app
USER cirta

# Health check Docker natif (Render l'utilise aussi)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/health || exit 1

EXPOSE 3000

# Démarrage en production
CMD ["node", "dist/main.js"]
