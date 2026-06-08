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
RUN node_modules/.bin/tsc -p apps/gateway/tsconfig.app.json 2>&1 && find dist -name "main.js" 2>/dev/null || echo "main.js introuvable"

# +--------------------------------------------------------+
# |                         RUNTIME                        |
# +--------------------------------------------------------+
FROM node:26-alpine AS runtime
WORKDIR /app
# Copy node_modules from build stage (flat structure thanks to --node-linker=hoisted)
COPY --from=build /app/node_modules ./node_modules
# Copy built application from the build stage
COPY --from=build /app/dist/apps/gateway/ ./dist/apps/gateway
CMD ["node", "dist/apps/gateway/main.js"]

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
