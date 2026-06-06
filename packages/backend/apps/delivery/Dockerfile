# +--------------------------------------------------------+
# |                         BUILD                          |
# +--------------------------------------------------------+
FROM ghcr.io/pnpm/pnpm:11 AS build
RUN pnpm runtime set node 26 -g
WORKDIR /app
# Copy package files and install dependencies (hoisted = flat node_modules, no symlinks)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --node-linker=hoisted
# Copy source code, generate Prisma client and build
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build delivery

# +--------------------------------------------------------+
# |                         RUNTIME                        |
# +--------------------------------------------------------+
FROM node:26-alpine AS runtime
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/delivery/ ./dist/apps/delivery
COPY --from=build /app/prisma ./prisma
CMD ["sh", "-c", "export DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB && node_modules/.bin/prisma migrate deploy && node dist/apps/delivery/main.js"]

# +--------------------------------------------------------+
# |                      DEVELOPMENT                       |
# +--------------------------------------------------------+
FROM ghcr.io/pnpm/pnpm:11 AS development
RUN pnpm runtime set node 26 -g
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec prisma generate
CMD ["sh", "-c", "export DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB && pnpm exec prisma migrate deploy && pnpm run dev:delivery"]
