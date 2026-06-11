# Transvirex ERP — Moving Intelligence

**Transvirex Logistics** is a logistics ERP designed to digitize regional transport operations. This monorepo contains the complete platform: a Nuxt 4 frontend, a NestJS 11 microservices backend, an AI agent (FastAPI + DeepSeek), and a full Kubernetes deployment pipeline.

---

## Tech Stack

| Layer           | Technology                                                      |
| --------------- | --------------------------------------------------------------- |
| Frontend        | Nuxt 4 (Vue 3, TypeScript 6), Tailwind CSS 4, shadcn-vue, Pinia |
| Backend         | NestJS 11 monorepo, TypeScript 5.7, Prisma 7                    |
| AI Agent        | Python 3.12, FastAPI, DeepSeek LLM, RAG (MongoDB)               |
| Databases       | PostgreSQL 16, MongoDB 7, Redis 7                               |
| Message Queue   | RabbitMQ 3.13                                                   |
| Infrastructure  | Docker, Kubernetes, Kustomize, Traefik v2.10                    |
| CI/CD           | GitHub Actions (8 parallel builds → auto-deploy to VPS)         |
| Package Manager | pnpm (workspaces)                                               |

---

## Project Structure

```
transvirex/
├── docs/                          # Documentation
├── packages/
│   ├── frontend/                  # Nuxt 4 SPA
│   └── backend/                   # NestJS monorepo
│       ├── apps/
│       │   ├── gateway/           # API Gateway
│       │   ├── authentication/    # Auth microservice
│       │   ├── delivery/          # Delivery management
│       │   ├── billing/           # Invoicing & billing
│       │   ├── stock/             # Stock management
│       │   ├── users/             # User management
│       │   └── ai/                # Python AI agent (FastAPI)
│       └── libs/
│           ├── database/          # Prisma client
│           ├── guards/            # Auth guards & decorators
│           ├── rabbitmq/          # RabbitMQ client
│           ├── redis/             # Redis client
│           ├── mongodb/           # MongoDB client
│           └── logging/           # Logging utilities
├── kubernetes/                    # K8s manifests (Kustomize)
├── development/                   # Local dev SSL & nginx config
├── docker-compose.yml             # Full-stack orchestration
└── .github/workflows/deploy.yaml  # CI/CD pipeline
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 9
- Docker & Docker Compose
- Python 3.12 (for AI service)

### Development

```bash
pnpm install
pnpm dev                 # starts all services in dev mode
pnpm build               # builds all packages
pnpm prod                # builds + runs in production mode
```

> See [docs/en/ONBOARDING.md](docs/en/ONBOARDING.md) for the full setup guide.

---

## Documentation

| Document                                    | Description                                |
| ------------------------------------------- | ------------------------------------------ |
| [Needs Analysis](docs/en/NEEDS_ANALYSIS.md) | Business context, user roles, requirements |
| [Architecture](docs/en/ARCHITECTURE.md)     | System architecture with Mermaid diagrams  |
| [Manual Testing](docs/en/MANUAL_TESTING.md) | End-to-end test scenarios by user role     |
| [Onboarding](docs/en/ONBOARDING.md)         | Dev & production setup guide               |
| [Contributing](docs/CONTRIBUTING.md)        | How to contribute                          |
| [Design System](docs/en/Design%20System.md) | Brand, typography, colors, assets          |

---

## Architecture Overview

```
                  ┌──────────────┐
                  │   Nuxt 4     │
                  │   Frontend   │
                  └──────┬───────┘
                         │ REST / Proxy
                  ┌──────▼───────┐
                  │   Gateway    │
                  │   (NestJS)   │
                  └──┬───┬───┬──┘
        ┌────────────┤   │   ├────────────┐
   ┌────▼───┐  ┌────▼───┐ │ ┌─▼─────┐ ┌───▼────┐
   │  Auth  │  │Delivery│ │ │Users  │ │Billing │
   │(NestJS)│  │(NestJS)│ │ │(NestJS│ │(NestJS)│
   └───┬────┘  └───┬────┘ │ └───┬───┘ └───┬────┘
       │           │      │     │          │
   ┌───▼───────────▼──────▼─────▼──────────▼───┐
   │         Message Queue (RabbitMQ)          │
   └────────────────────┬──────────────────────┘
                        │
   ┌────────────────────▼──────────────────────┐
   │        AI Agent (FastAPI + DeepSeek)      │
   │     ┌──────────┐  ┌─────────┐             │
   │     │   RAG    │  │ Incident│             │
   │     │Knowledge │  │Detection│             │
   │     └──────────┘  └─────────┘             │
   └───────────────────────────────────────────┘

   ┌────────┬────────┬────────┬────────────────┐
   │Postgres│ MongoDB│  Redis │  RabbitMQ      │
   │ (Main) │  (AI)  │ (Cache)│  (Queue)       │
   └────────┴────────┴────────┴────────────────┘
```

---

## Key Features

- **Multi-role dashboards**: Admin, Dispatcher, Driver, Business Manager
- **Real-time delivery tracking**: Status updates via RabbitMQ
- **AI Assistant**: DeepSeek-powered chat, incident detection, RAG knowledge base
- **Automated billing**: Invoice generation & payment tracking
- **Kubernetes-native**: Deployable on any VPS with a single GitHub push
- **CI/CD pipeline**: 8 parallel Docker builds → rolling deployment

---

## License

This project uses open-source tools — [Kubernetes](https://kubernetes.io/), [Helm](https://helm.sh/), [Traefik](https://traefik.io/), [Jenkins](https://jenkins.io/).

