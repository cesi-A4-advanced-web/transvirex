# +--------------------------------------------------------+
# |                         BUILD                          |
# +--------------------------------------------------------+
FROM ghcr.io/pnpm/pnpm:11 AS build
RUN pnpm runtime set node 26 -g
WORKDIR /app
# Copy package files and install dependencies (hoisted = flat node_modules, no symlinks)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --node-linker=hoisted
# Copy source code and generate Prisma client
COPY . .
RUN pnpm exec prisma generate
# Build the application
RUN node_modules/.bin/tsc -p apps/authentication/tsconfig.app.json 2>&1

# +--------------------------------------------------------+
# |                         RUNTIME                        |
# +--------------------------------------------------------+
FROM node:26-alpine AS runtime
WORKDIR /app
# Copy node_modules from build stage (flat structure thanks to --node-linker=hoisted)
COPY --from=build /app/node_modules ./node_modules
# Copy built application from the build stage
COPY --from=build /app/dist/apps/authentication/ ./dist/apps/authentication
# Copy Prisma schema and migrations for migrate deploy
COPY --from=build /app/prisma ./prisma
CMD ["sh", "-c", " node_modules/.bin/prisma migrate deploy && node dist/apps/authentication/src/main.js"]

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
# Run migrations then start the development server
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm run dev:authentication"]
