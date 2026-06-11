# Contributing to Transvirex ERP

## Workflow

1. Fork the repository and create a branch from `develop`
2. Make your changes following the guidelines below
3. Open a Pull Request targeting `develop`
4. Ensure CI passes and your changes are reviewed

## Branch Naming

```
feature/<short-description>    # New features
fix/<short-description>        # Bug fixes
refactor/<short-description>   # Code refactoring
docs/<short-description>       # Documentation changes
chore/<short-description>      # Maintenance tasks
```

## Commit Messages

Use conventional commits:

```
feat: add delivery status notification
fix: resolve invoice PDF encoding issue
refactor: extract auth guard to shared lib
docs: update API endpoint examples
chore: bump nestjs dependencies
```

## Code Style

- **TypeScript**: Strict mode enabled, explicit types preferred
- **Formatting**: Prettier with `printWidth: 120`, `singleQuote`, `tabWidth: 4`
- **Imports**: Organized by path aliases (`@app/*`, `@generated/*`)
- **Components**: Follow Nuxt conventions — auto-imported composables, PascalCase components
- **NestJS**: Maintain modular structure — each service has its own module, controller, service, DTO
- **Python (AI)**: Follow PEP 8, async functions for I/O, type hints required

Before committing:

```bash
pnpm lint           # Lint all packages
pnpm format:check   # Check formatting
pnpm test           # Run tests
```

## Project Architecture

```
packages/
├── frontend/          # Nuxt 4 SPA
│   ├── app/
│   │   ├── components/   # Vue components (auto-imported)
│   │   ├── composables/  # Shared logic (auto-imported)
│   │   ├── layouts/      # Page layouts
│   │   ├── pages/        # Route pages
│   │   ├── stores/       # Pinia stores
│   │   └── plugins/      # Nuxt plugins
│   └── nuxt.config.ts
└── backend/            # NestJS monorepo
    ├── apps/
    │   ├── gateway/        # API Gateway
    │   ├── authentication/ # Auth service
    │   ├── delivery/       # Delivery management
    │   ├── billing/        # Invoicing
    │   ├── stock/          # Inventory
    │   ├── users/          # User management
    │   └── ai/             # Python AI service
    └── libs/
        ├── database/   # Prisma client
        ├── guards/     # Auth guards & decorators
        ├── rabbitmq/   # AMQP client
        ├── redis/      # Redis client
        └── logging/    # Logger utility
```

## Adding a New Feature

### Frontend

1. Create the page in `packages/frontend/app/pages/<role>/`
2. Add composables in `packages/frontend/app/composables/`
3. Add store in `packages/frontend/app/stores/` if needed
4. Use existing shadcn-vue components from `components/ui/`

### Backend (NestJS)

1. Add or modify a controller in the appropriate service
2. Create DTOs with `class-validator` decorators
3. Implement business logic in the service
4. Add Prisma schema changes in `prisma/schema.prisma`
5. Run `pnpm --filter @transvirex/backend prisma:migrate` to generate migration

### Backend (AI / Python)

1. Add routes in `packages/backend/apps/ai/app/routes/`
2. Add service logic in `packages/backend/apps/ai/app/services/`
3. Update `requirements.txt` if adding dependencies
4. Test via `curl https://transvirex.local/api/docs` (Swagger UI)

## Running Tests

```bash
# All packages
pnpm test

# Specific package
pnpm --filter @transvirex/backend test
pnpm --filter @transvirex/gateway test:e2e

# AI service
cd packages/backend/apps/ai
pytest
```

## Review Process

1. At least one approval required before merging
2. CI must pass (lint, typecheck, tests)
3. Squash-merge into `develop`
4. `main` is updated via release branches only

## Questions?

- Check existing docs in `docs/`
- Search open/closed issues
- Contact the team on Discord

