# +--------------------------------------------------------+
# |                         BUILD                          |
# +--------------------------------------------------------+
FROM ghcr.io/pnpm/pnpm:11 AS build
RUN pnpm runtime set node 26 -g
WORKDIR /app
# Copy package files and install dependencies (hoisted = flat node_modules, no symlinks)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --node-linker=hoisted
# Copy source code, generate Prisma client and build
COPY . .
RUN pnpm exec prisma generate
RUN node_modules/.bin/tsc -p tsconfig.build.json 2>&1 && mkdir -p dist/prisma

# +--------------------------------------------------------+
# |                         RUNTIME                        |
# +--------------------------------------------------------+
FROM node:26-slim AS runtime
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/gateway/ ./dist/apps/gateway/
COPY --from=build /app/dist/libs/ ./libs/
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist/prisma/ ./prisma/
COPY --from=build /app/tsconfig.json ./tsconfig.json
CMD ["node", "-r", "tsconfig-paths/register", "dist/apps/gateway/src/main.js"]

# +--------------------------------------------------------+
# |                      DEVELOPMENT                       |
# +--------------------------------------------------------+
FROM ghcr.io/pnpm/pnpm:11 AS development
RUN pnpm runtime set node 26 -g
WORKDIR /app
# Copy package files and install all dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
# Copy source code for development
COPY . .
RUN pnpm exec prisma generate
# Start the development server
CMD ["pnpm", "run", "dev:gateway"]
