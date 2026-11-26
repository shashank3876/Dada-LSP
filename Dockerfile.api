FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm@10.34.3

COPY . .

RUN pnpm install --frozen-lockfile
RUN cd packages/database && npx prisma generate
RUN pnpm --filter "@dada/*" build
RUN pnpm --filter "api" build

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
