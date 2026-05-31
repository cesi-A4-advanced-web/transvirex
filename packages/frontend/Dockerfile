# +--------------------------------------------------------+
# |                         BUILD                          |
# +--------------------------------------------------------+

FROM ghcr.io/pnpm/pnpm:11 AS builder
RUN pnpm runtime set node 26 -g
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# +--------------------------------------------------------+
# |                         RUNTIME                        |
# +--------------------------------------------------------+
FROM node:26-slim AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server/index.mjs"]

# +--------------------------------------------------------+
# |                      DEVELOPMENT                       |
# +--------------------------------------------------------+
FROM builder AS development
WORKDIR /app
COPY --from=builder /app ./
CMD ["pnpm", "run", "dev", "--host"]

