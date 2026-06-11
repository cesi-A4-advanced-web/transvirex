# +--------------------------------------------------------+
# |                         BUILD                          |
# +--------------------------------------------------------+
FROM ghcr.io/pnpm/pnpm:11 AS build
RUN pnpm runtime set node 26 -g
WORKDIR /app
# Copy package files and install dependencies (hoisted = flat node_modules, no symlinks)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --no-frozen-lockfile --node-linker=hoisted
# Copy source code and generate Prisma client
COPY . .
RUN pnpm exec prisma generate
# Build the application
RUN pnpm run build:authentication

# +--------------------------------------------------------+
# |                         RUNTIME                        |
# +--------------------------------------------------------+
FROM node:26-slim AS runtime
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/authentication/ ./apps/authentication/
COPY --from=build /app/dist/libs/ ./libs/
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist/prisma/ ./prisma/
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
CMD ["sh", "-c", "node -r tsconfig-paths/register apps/authentication/src/main.js"]

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
CMD ["sh", "-c", "pnpm run dev:authentication"]
