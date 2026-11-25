FROM node:22-bookworm-slim AS base
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.34.3 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/worker/package.json ./apps/worker/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/database/package.json ./packages/database/
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app ./
COPY apps/api ./apps/api
COPY packages/contracts ./packages/contracts
COPY packages/database ./packages/database
COPY packages/config ./packages/config
COPY packages/ui ./packages/ui
RUN pnpm --filter @dada/contracts build \
  && pnpm --filter @dada/database db:generate \
  && pnpm --filter @dada/database build \
  && pnpm --filter api build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app ./
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
