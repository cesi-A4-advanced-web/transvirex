# +--------------------------------------------------------+
# |                         BUILD                          |
# +--------------------------------------------------------+
FROM ghcr.io/pnpm/pnpm:11 AS build
RUN pnpm runtime set node 26 -g
WORKDIR /app
# Copy package files and install dependencies (hoisted = flat node_modules, no symlinks)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --no-frozen-lockfile --node-linker=hoisted
# Copy source code, generate Prisma client and build
COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build:users

# +--------------------------------------------------------+
# |                         RUNTIME                        |
# +--------------------------------------------------------+
FROM node:26-slim AS runtime
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/users/ ./dist/apps/users/
COPY --from=build /app/dist/libs/ ./libs/
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist/prisma/ ./prisma/
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node -r tsconfig-paths/register dist/apps/users/src/main.js"]

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
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm run dev:users"]
