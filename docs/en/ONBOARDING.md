# Onboarding — Transvirex ERP

This guide covers setting up Transvirex ERP for **local development** and **production deployment**.

---

## Development Setup

### Prerequisites

| Tool             | Version | Purpose                 |
| ---------------- | ------- | ----------------------- |
| Node.js          | >= 22   | JavaScript runtime      |
| pnpm             | >= 9    | Package manager         |
| Docker & Compose | Latest  | Infrastructure services |
| Python           | >= 3.12 | AI service runtime      |
| Git              | Latest  | Version control         |

### 1. Clone & Install

```bash
git clone <repo-url>
cd CESI_A4_DevWeb
pnpm install
```

### 2. Configure Environment

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env
```

Key development defaults (already set in `.env.example`):

| Variable        | Default       | Description             |
| --------------- | ------------- | ----------------------- |
| `NODE_ENV`      | `development` | Application environment |
| `FRONTEND_PORT` | `5173`        | Nuxt dev server port    |
| `API_PORT`      | `3000`        | Gateway port            |
| `POSTGRES_DB`   | `transvirex`  | Database name           |
| `RABBITMQ_USER` | `user`        | RabbitMQ username       |
| `REDIS_DB`      | `0`           | Redis database index    |

For the AI service, copy its env file too:

```bash
cp packages/backend/apps/ai/.env.example packages/backend/apps/ai/.env
# Set DEEPSEEK_API_KEY in that file
```

### 3. Start Infrastructure

Launch databases and message queues via Docker Compose:

```bash
docker compose up -d postgres rabbitmq redis mongodb
```

This starts:

- PostgreSQL 16 on port `5432`
- RabbitMQ 3.13 on ports `5672` (AMQP) and `15672` (management UI)
- Redis 7 on port `6379`
- MongoDB 7 on port `27017`

### 4. Run Database Migration & Seed

```bash
# Generate Prisma client
pnpm --filter @transvirex/backend prisma:generate

# Run migrations
pnpm --filter @transvirex/backend prisma:migrate

# Seed the database
pnpm --filter @transvirex/backend prisma:seed
```

### 5. Start All Development Services

From the project root, start everything with a single command:

```bash
pnpm dev
```

This runs:

- **Frontend** (Nuxt 4) — hot-reload at `https://transvirex.local`
- **Gateway** (NestJS) — watch mode
- **Authentication** (NestJS) — watch mode
- **Delivery** (NestJS) — watch mode
- **Billing** (NestJS) — watch mode
- **Users** (NestJS) — watch mode
- **Stock** (NestJS) — watch mode
- **AI Service** (FastAPI) — watch mode

> The frontend proxies `/api/*` requests to the Gateway, so you only need to access `https://transvirex.local`.

### 6. Start Individual Services (Alternative)

If you prefer to run only specific services:

```bash
pnpm --filter @transvirex/frontend dev       # Frontend only
pnpm --filter @transvirex/gateway start:dev   # Gateway only
pnpm --filter @transvirex/backend start:dev   # All backend services
```

### 7. Local Nginx Setup (Optional)

For HTTPS and proper domain routing locally:

```bash
# Add hosts entries (Linux/macOS)
sudo bash development/setup-hosts.sh

# Start nginx
docker compose up -d nginx
```

This makes the app available at `https://transvirex.local`.

### 8. Verifying the Setup

| Check           | URL                                  | Expected             |
| --------------- | ------------------------------------ | -------------------- |
| Frontend        | `https://transvirex.local`           | Login page           |
| API Health      | `http://transvirex.local/api/health` | `{ "status": "ok" }` |
| RabbitMQ UI     | `http://rabbitmq.transvirex.local`   | Login (user/user)    |
| Redis Commander | `http://redis.transvirex.local`      | Redis browser        |

---

## Production Deployment

### Architecture

Production runs on **Kubernetes** with **Traefik** as ingress controller, deployed via **GitHub Actions** CI/CD pipeline.

### Prerequisites

- A VPS with at least **4 vCPUs, 8 GB RAM, 50 GB SSD**
- A domain name with DNS pointing to the VPS
- A GitHub account with repository access
- A GitHub Personal Access Token with `packages:write` and `repo` scopes

### 1. Configure GitHub Secrets

Go to repository **Settings → Secrets and variables → Actions** and add:

| Secret                | Description                            |
| --------------------- | -------------------------------------- |
| `VPS_HOST`            | VPS IP address or hostname             |
| `VPS_SSH_KEY`         | Private SSH key for VPS access         |
| `GHCR_PAT`            | GitHub PAT with `packages:write` scope |
| `JWT_SECRET`          | Random string for JWT signing          |
| `DEEPSEEK_API_KEY`    | DeepSeek API key for AI service        |
| `DISCORD_WEBHOOK_URL` | (Optional) Discord notification URL    |

### 2. Prepare the VPS

The CI/CD pipeline expects:

- Docker installed
- Kubernetes (k3s recommended for single-node)
- `kubectl` configured
- `kustomize` installed

Connect to your VPS and run:

```bash
# Install k3s
curl -sfL https://get.k3s.io | sh -

# Install kustomize
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
sudo mv kustomize /usr/local/bin/
```

### 3. Deploy

Push to the `main` branch — GitHub Actions will:

1. Build all 8 Docker images (frontend, gateway, auth, delivery, billing, stock, users, AI)
2. Push them to GHCR (GitHub Container Registry)
3. SSH into the VPS
4. Apply the Kustomize manifests
5. Perform a rolling restart of all deployments
6. Run the database seed job
7. Send a Discord notification

```bash
git push origin main
```

Monitor the pipeline: **GitHub → Actions → deploy workflow**.

### 4. Verify Production

| URL                              | Service           |
| -------------------------------- | ----------------- |
| `https://transvirex.com`         | Frontend          |
| `https://transvirex.com/api`     | API Gateway       |
| `https://traefik.transvirex.com` | Traefik Dashboard |
| `https://redis.transvirex.com`   | Redis Commander   |

### Scaling

- **Horizontal scaling**: Increase replicas in `kubernetes/services/*.yaml`
- **Database scaling**: Upgrade PVC sizes or migrate to managed cloud databases
- **AI Service**: Scale independently with multiple replicas (stateless by design)

---

## Useful Commands

### Docker Compose (Development)

```bash
docker compose up -d           # Start all services
docker compose down            # Stop all services
docker compose logs -f         # Follow logs
docker compose ps              # List running services
```

### pnpm Workspace

```bash
pnpm dev                       # Start all services in dev mode
pnpm build                     # Build all packages
pnpm prod                      # Build + run in production mode
pnpm --filter <package> <cmd>  # Run command in specific package
pnpm lint                      # Lint all packages
pnpm test                      # Run all tests
```

### Kubernetes (Production)

```bash
kubectl get pods -n production
kubectl logs -n production deploy/<service> -f
kubectl rollout restart -n production deploy/<service>
kubectl describe pod -n production <pod-name>
```

### Prisma

```bash
pnpm --filter @transvirex/backend prisma:generate  # Generate client
pnpm --filter @transvirex/backend prisma:migrate   # Run migrations
pnpm --filter @transvirex/backend prisma:seed      # Seed database
pnpm --filter @transvirex/backend prisma:studio    # Open Prisma Studio
```

---

## Troubleshooting

### Port already in use

```bash
# Find and kill process on port
sudo lsof -i :3000
kill -9 <PID>
```

### Docker containers not starting

```bash
docker compose logs postgres    # Check PostgreSQL logs
docker compose logs rabbitmq    # Check RabbitMQ logs
```

### Database connection refused

Verify containers are running and `.env` matches `docker-compose.yml` hostnames.

### Frontend proxy not working

Check that the Gateway is running on port `3000` and `API_HOST` / `API_PORT` are correctly set in `.env`.

### Prisma migration fails

```bash
# Reset database and re-run
pnpm --filter @transvirex/backend prisma:migrate reset
pnpm --filter @transvirex/backend prisma:migrate dev
pnpm --filter @transvirex/backend prisma:seed
```

### AI Service not responding

Check `DEEPSEEK_API_KEY` is set and the service is running.
