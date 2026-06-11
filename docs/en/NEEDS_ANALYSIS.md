# Needs Analysis — Transvirex Logistics

## 1. Business Context

Transvirex Logistics was founded on a simple idea: digitize regional transport. In five years, the company has grown from 12 drivers to over 160 independent contractors, processing nearly 15,000 deliveries per month.

This rapid growth has exposed critical operational limits:

- Dispatchers juggle WhatsApp, phone calls, and emails with no global view
- Drivers learn about route changes too late
- Billing averages 6 days of delay due to manual data reconciliation
- Customer complaints are rising — a major e-commerce client temporarily suspended their contract after untraceable delivery disputes

The company needs to transition from human-driven operations to system-assisted management.

## 2. User Roles & Pain Points

### Driver / Delivery Person

| Need | Pain Point |
|------|-----------|
| View daily route | Incomplete information received via phone/WhatsApp |
| Accept or decline missions | No formal system — changes discovered too late |
| Report delivery completion or incidents | No centralized reporting tool |
| View mission history | No accessible record |

### Dispatcher / Hub Manager

| Need | Pain Point |
|------|-----------|
| Create and assign missions to drivers | No unified assignment interface |
| Track delivery status in real time | Relies on phone calls for updates |
| View global workload across hubs | Fragmented data across channels |
| Receive alerts on delays or anomalies | No automated monitoring |

### Billing Department

| Need | Pain Point |
|------|-----------|
| Track invoiced vs. non-invoiced deliveries | Data not centralized — manual cross-referencing |
| Automatic invoice generation and export | Manual process causing 6-day average delay |
| Payment history and reminders | No consolidated view |

### Management / Logistics Director

| Need | Pain Point |
|------|-----------|
| Dashboards on efficiency, costs, customer satisfaction | No KPIs available |
| Performance analysis by driver, hub, or region | Data scattered across sources |
| Identify overload or underutilization points | Decision-making based on gut feeling |

## 3. Strategic Objectives

1. **Structure operational flows** — Replace ad-hoc communication with a unified platform
2. **Centralize data** — Single source of truth for all logistics operations
3. **Enable real-time tracking** — Live delivery status for all stakeholders
4. **Produce reliable KPIs** — Data-driven dashboards for management
5. **Support national scale** — Architecture designed for horizontal scaling
6. **AI-powered automation** — Intelligent agent to assist with operational processes

## 4. Functional Requirements

### Core Modules

| Module | Description |
|--------|-------------|
| Delivery Management | Create, assign, track deliveries with status lifecycle |
| User & Role Management | Multi-role access (admin, dispatcher, driver, business manager) |
| Hub Management | Manage warehouses/hubs, each with its own resources |
| Driver & Vehicle Management | Assign drivers to vehicles, track availability |
| Customer Management | Customer directory with delivery history |
| Invoicing & Billing | Automatic invoice generation, payment tracking |
| Real-time Dashboard | Per-role dashboards with key metrics |
| AI Assistant | Chat, incident detection, smart notifications |

### Delivery Lifecycle

```
Planned → Delivering → Delivered
                            ↓
    Cancelled / Blocked / Delayed
```

### User Roles & Permissions

| Role | Access |
|------|--------|
| Admin | Full system access, user management, configuration |
| Dispatcher | Create/assign missions, track deliveries, hub oversight |
| Driver | View routes, accept/decline missions, report status |
| Business Manager | Invoices, billing, financial reports |

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Handle 15,000+ monthly deliveries with sub-second response times |
| Scalability | Horizontal scaling for national expansion |
| Availability | High-availability with Kubernetes orchestration |
| Security | JWT authentication, role-based access, encrypted traffic |
| Maintainability | Modular microservices architecture with clear boundaries |
| Interoperability | REST APIs, message queues for async communication |
| Observability | Centralized logging, health endpoints, monitoring dashboards |
| Portability | Fully containerized, deployable on any cloud or VPS |

## 6. AI Agent — Innovation Opportunity

Management wants to maintain competitiveness by integrating an AI agent. The project includes designing a **single AI agent** capable of automating or facilitating logistics processes. Key capabilities:

- **Natural language chat** — Drivers and dispatchers interact via conversational interface
- **Incident detection** — Automated anomaly detection in delivery data
- **RAG knowledge base** — Retrieval-Augmented Generation for operational knowledge
- **Smart notifications** — Context-aware alerts for delays, changes, or anomalies
- **NLP processing** — Parse and structure unstructured messages from drivers

The agent uses **DeepSeek LLM** with a **FastAPI** backend and **MongoDB** for vector storage. It communicates with the rest of the ERP via RabbitMQ and REST.
