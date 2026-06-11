# Architecture — Transvirex ERP

## 1. High-Level Architecture

The system follows a **microservices architecture** with an API Gateway pattern. Each backend service is independently deployable, communicates via RabbitMQ for async messages, and shares data through dedicated databases.

```mermaid
graph TB
    subgraph "Client Layer"
        BROWSER[Browser / SPA]
    end

    subgraph "Reverse Proxy"
        NGINX[Nginx]
    end

    subgraph "Frontend"
        NUXT[Nuxt 4 SPA<br/>Vue 3 / Tailwind / Pinia]
    end

    subgraph "API Gateway"
        GW[Gateway<br/>NestJS 11]
    end

    subgraph "Microservices"
        AUTH[Authentication<br/>NestJS]
        DEL[Delivery<br/>NestJS]
        BILL[Billing<br/>NestJS]
        STK[Stock<br/>NestJS]
        USR[Users<br/>NestJS]
    end

    subgraph "AI Agent"
        AI[AI Service<br/>FastAPI / DeepSeek]
        MCP[MCP Server<br/>Model Context Protocol]
    end

    subgraph "Message Queue"
        RMQ[RabbitMQ]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL 16<br/>Structured Data)]
        MONGO[(MongoDB 7<br/>AI / Audit)]
        REDIS[(Redis 7<br/>Cache / Sessions)]
    end

    BROWSER --> NGINX
    NGINX --> NUXT
    NUXT --> GW
    GW --> AUTH
    GW --> DEL
    GW --> BILL
    GW --> STK
    GW --> USR
    GW --> AI

    AUTH --> RMQ
    DEL --> RMQ
    BILL --> RMQ
    STK --> RMQ
    USR --> RMQ
    AI --> RMQ

    AUTH --> PG
    DEL --> PG
    BILL --> PG
    STK --> PG
    USR --> PG

    AUTH --> REDIS
    GW --> REDIS

    AI --> MONGO
    AI --> REDIS

    AI --> MCP
```

## 2. Frontend Architecture

The frontend is a **Nuxt 4** single-page application with server-side rendering support.

```mermaid
graph TB
    subgraph "Nuxt 4 App"
        APP[app.vue]
        LAY[dashboard.vue<br/>Layout]
        
        subgraph "Pages"
            P1[admin/*]
            P2[dispatcher/*]
            P3[livreur/*]
            P4[debug/*]
        end
        
        subgraph "State (Pinia)"
            S1[health Store]
            S2[logs Store]
            S3[mongodb Store]
            S4[rabbitmq Store]
            S5[redis Store]
            S6[sql Store]
        end
        
        subgraph "Composables"
            C1[useApi]
            C2[useAuth]
            C3[useAiAssistant]
            C4[useNotifications]
            C5[usePdfExport]
            C6[useErrorLogger]
        end
        
        subgraph "UI Components"
            UI[shadcn-vue / Reka UI]
        end
    end

    APP --> LAY
    LAY --> P1
    LAY --> P2
    LAY --> P3
    LAY --> P4
    
    P1 --> S1
    P2 --> S2
    P3 --> S3
    
    C1 --> GW
    C2 --> AUTH
    C3 --> AI
```

### Frontend Key Decisions

- **Nuxt 4** with SSR for SEO and initial load performance
- **Pinia 3** for state management with modular stores
- **Tailwind CSS 4 + shadcn-vue** for consistent, accessible UI
- **Chart.js + vue-chartjs** for dashboard visualizations
- **jsPDF** for invoice PDF generation
- **@lucide/vue** icons throughout
- **Reka UI** headless components for complex interactions
- Auto-imported composables via Nuxt's composables directory

### Pages by Role

| Role | Pages |
|------|-------|
| Admin | Dashboard, Users, Hubs, Drivers, Vehicles, Customers, Parcels, Deliveries, Invoices, Reports, Settings |
| Dispatcher | Dashboard, Deliveries, Drivers, Customers, Parcels, Invoices |
| Driver | Dashboard, Deliveries, AI Assistant, Profile |
| Debug | Health, Logs, PostgreSQL, MongoDB, Redis, RabbitMQ |

## 3. Backend Architecture (NestJS Monorepo)

```mermaid
graph TB
    subgraph "NestJS Monorepo"
        subgraph "Shared Libraries"
            LIB_DB[database<br/>Prisma Client]
            LIB_GUARDS[guards<br/>JWT / Roles]
            LIB_RMQ[rabbitmq<br/>AMQP Client]
            LIB_REDIS[redis<br/>ioredis]
            LIB_MONGO[mongodb<br/>MongoDB Driver]
            LIB_LOG[logging]
        end

        subgraph "Applications"
            GW[gateway<br/>Port 3000]
            AUTH[authentication<br/>JWT Issuance]
            DEL[delivery<br/>Mission Mgmt]
            BILL[billing<br/>Invoices]
            STK[stock<br/>Inventory]
            USR[users<br/>CRUD]
        end
    end

    GW --> LIB_GUARDS
    AUTH --> LIB_RMQ
    AUTH --> LIB_REDIS
    DEL --> LIB_RMQ
    DEL --> LIB_REDIS
    BILL --> LIB_RMQ
    USR --> LIB_RMQ

    AUTH --> LIB_DB
    DEL --> LIB_DB
    BILL --> LIB_DB
    STK --> LIB_DB
    USR --> LIB_DB

    LIB_DB --> PG
    LIB_RMQ --> RMQ
    LIB_REDIS --> REDIS
    LIB_MONGO --> MONGO
```

### Microservices Responsibility

| Service | Responsibility | Dependencies |
|---------|---------------|-------------|
| **Gateway** | API facade, request routing, auth delegation, DTO validation | PostgreSQL, Redis, RabbitMQ |
| **Authentication** | JWT issue/refresh, login, role extraction | PostgreSQL, Redis, RabbitMQ |
| **Delivery** | Mission CRUD, status lifecycle, driver assignment | PostgreSQL, RabbitMQ, Redis |
| **Billing** | Invoice generation, payment tracking, export | PostgreSQL, RabbitMQ |
| **Users** | User CRUD, hub assignment, roles | PostgreSQL, RabbitMQ |
| **Stock** | Inventory management | PostgreSQL |

### Communication Patterns

- **Synchronous**: REST over HTTP (Gateway → Services via internal routes)
- **Asynchronous**: RabbitMQ for event-driven updates (status changes, notifications)
- **Caching**: Redis for session tokens, rate limiting, temporary data
- **Database-per-service**: Each service connects to PostgreSQL independently

## 4. AI Agent Architecture

```mermaid
graph LR
    subgraph "AI Service (FastAPI)"
        CHAT[Chat Routes]
        INC[Incident Detection]
        KNOW[Knowledge Base<br/>RAG]
        NOTIF[Smart Notifications]
        NLP[NLP Processing]
    end

    subgraph "LLM"
        DS[DeepSeek API]
    end

    subgraph "Storage"
        M[(MongoDB<br/>Vectors / History)]
        R[(Redis<br/>Cache)]
    end

    subgraph "ERP Integration"
        RMQ[RabbitMQ]
        GW[Gateway]
    end

    CHAT --> DS
    INC --> DS
    KNOW --> DS
    NOTIF --> DS
    NLP --> DS

    CHAT --> M
    INC --> M
    KNOW --> M
    NOTIF --> R
    NLP --> R

    INC --> RMQ
    NOTIF --> RMQ

    GW --> CHAT
    GW --> INC
```

### AI Features

| Feature | Description |
|---------|-------------|
| **Chat** | Conversational interface for drivers and dispatchers |
| **Incident Detection** | Monitors delivery data for anomalies and triggers alerts |
| **RAG Knowledge Base** | Retrieval-Augmented Generation using MongoDB vector store |
| **Smart Notifications** | Context-aware alerts sent via RabbitMQ to the frontend |
| **NLP Processing** | Parses unstructured messages (WhatsApp/phone transcripts) |
| **MCP Protocol** | Model Context Protocol server for standardized AI tool access |

### Tech Choices

- **FastAPI** for async Python performance with automatic OpenAPI docs
- **DeepSeek LLM** for cost-effective, high-quality language model inference
- **Motor** (async MongoDB driver) for non-blocking database access
- **MCP** for standardized model-to-tool integration

## 5. Database Schema (Prisma)

```mermaid
erDiagram
    Hub ||--o{ User : has
    Hub ||--o{ Vehicle : has
    Hub ||--o{ Customer : has
    Hub ||--o{ Invoice : has
    Hub {
        uuid id PK
        string name
        string city
        enum status
    }

    User ||--o| Driver : is
    User {
        uuid id PK
        string email
        string password
        enum role
        enum status
    }

    Driver ||--o{ Delivery : assigned
    Driver {
        uuid id PK
        string license_number
        string phone
    }

    Vehicle {
        uuid id PK
        string plate
        string model
        int capacity
    }

    Customer ||--o{ Invoice : has
    Customer {
        uuid id PK
        string name
        enum status
    }

    Invoice ||--o{ Delivery : includes
    Invoice ||--o{ Parcel : contains
    Invoice {
        uuid id PK
        string reference
        enum status
        enum service_type
        enum priority
        decimal total_ht
        decimal total_ttc
    }

    Delivery ||--o{ DeliveryEvent : tracks
    Delivery {
        uuid id PK
        enum status
        datetime scheduled_at
        datetime completed_at
    }

    DeliveryEvent {
        uuid id PK
        enum type
        enum status
        string description
    }

    Parcel {
        uuid id PK
        string label
        float weight
        string dimensions
    }

    Address {
        uuid id PK
        string street
        string city
        string postal_code
        float lat
        float lng
    }
```

### Data Storage Strategy

| Database | Purpose | Technology |
|----------|---------|------------|
| PostgreSQL | Structured business data (users, deliveries, invoices) | Prisma ORM |
| MongoDB | AI agent data (vectors, chat history, knowledge base) | Motor (async) |
| Redis | Session cache, rate limiting, real-time flags | ioredis |

## 6. Deployment Architecture

```mermaid
graph TB
    subgraph "Developer"
        DEV[git push]
    end

    subgraph "GitHub"
        ACTIONS[GitHub Actions]
        REGISTRY[GHCR<br/>Container Registry]
    end

    subgraph "VPS (Production)"
        K8S[Kubernetes]
        TRAEFIK[Traefik Ingress]
        
        subgraph "Pods"
            FE[Frontend]
            GW_P[Gateway]
            AUTH_P[Auth]
            DEL_P[Delivery]
            BILL_P[Billing]
            STK_P[Stock]
            USR_P[Users]
            AI_P[AI Service]
        end
        
        subgraph "Infrastructure"
            PG_P[PostgreSQL]
            MONGO_P[MongoDB]
            REDIS_P[Redis]
            RMQ_P[RabbitMQ]
        end
    end

    subgraph "External"
        DS_API[DeepSeek API]
        DISCORD[Discord Webhook]
    end

    DEV --> ACTIONS
    ACTIONS -->|Build 8 images| REGISTRY
    ACTIONS -->|SSH + kustomize| K8S
    
    K8S --> TRAEFIK
    TRAEFIK --> FE
    TRAEFIK --> GW_P
    
    GW_P --> AUTH_P
    GW_P --> DEL_P
    GW_P --> BILL_P
    GW_P --> STK_P
    GW_P --> USR_P
    GW_P --> AI_P

    AUTH_P --> PG_P
    DEL_P --> PG_P
    BILL_P --> PG_P
    STK_P --> PG_P
    USR_P --> PG_P

    AI_P --> MONGO_P
    AI_P --> REDIS_P
    AI_P --> DS_API

    AUTH_P --> RMQ_P
    DEL_P --> RMQ_P
    BILL_P --> RMQ_P
    AI_P --> RMQ_P

    ACTIONS -->|notify| DISCORD
```

### CI/CD Pipeline

1. **Push** to `main` or `develop` triggers GitHub Actions
2. **8 parallel builds** — each service is independently Dockerized and pushed to GHCR
3. **Smoke tests** — AI service container is started and `/health` is checked
4. **Deploy** (main only) — SSH into VPS, apply Kustomize manifests, rolling restart
5. **Notify** — Discord webhook on success/failure

### Infrastructure Requirements

| Resource | Spec |
|----------|------|
| VPS | 4 vCPU, 8 GB RAM, 50 GB SSD (minimum) |
| Kubernetes | Single-node (minikube/k3s) or multi-node cluster |
| Domain | Configured with TLS certificates |
| Secrets | JWT_SECRET, DEEPSEEK_API_KEY, GHCR_PAT |

## 7. Security Architecture

- **JWT authentication** with access + refresh token pair
- **Role-based access control** enforced at Gateway level
- **HTTPS everywhere** via Traefik with automatic TLS
- **Encrypted secrets** stored as Kubernetes Secrets (not in ConfigMaps)
- **Rate limiting** via @nestjs/throttler (configurable per endpoint)
- **Production guards** to block dangerous operations in production

## 8. Technology Decisions

| Decision | Rationale |
|----------|-----------|
| NestJS monorepo | Shared libraries (database, guards, Redis) reduce duplication |
| Nuxt 4 + SSR | SEO for public pages, fast initial render |
| Prisma 7 + PostgreSQL | Type-safe ORM with migrations for structured data |
| MongoDB for AI | Document model fits chat history and vector embeddings |
| RabbitMQ | Reliable async messaging between services |
| FastAPI for AI | Python ecosystem for ML/LLM, async by default |
| DeepSeek LLM | Cost-effective alternative to GPT-4 for logistics use cases |
| Kustomize | Native Kubernetes config without Helm complexity |
| Traefik | Automatic TLS, Kubernetes CRD support, middleware chain |
