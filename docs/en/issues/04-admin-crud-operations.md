# Issue: Missing CRUD Operations in Admin Pages

## Symptoms

The following CRUD operations are completely missing from the admin interface:

| # | Entity | Create | Edit | Delete |
|---|--------|--------|------|--------|
| 6-7 | Deliveries | Impossible | Impossible | Impossible |
| 8-9 | Parcels | Impossible | Impossible | Impossible |
| 10-11 | Customers | Impossible | Impossible | Impossible |
| 12-13 | Invoices | Impossible | Impossible | Impossible |
| 14-15 | Drivers | Impossible | Impossible | Impossible |
| 16-17 | Vehicles | Impossible | Impossible | Impossible |
| 18-19 | Users | Impossible | Impossible | Impossible |
| 20-21 | Hubs | Impossible | Impossible | Impossible |

**References:**
- `docs/fr/Liste erreurs.md` — Errors #6 through #21
- `docs/en/NEEDS_ANALYSIS.md` — Admin role: full system access, user management, configuration
- `docs/en/ARCHITECTURE.md` — Admin pages: Dashboard, Users, Hubs, Drivers, Vehicles, Customers, Parcels, Deliveries, Invoices, Reports, Settings

## Root Cause Analysis

The admin pages (`pages/admin/*`) were created as view-only pages. They likely:

1. Fetch and display data in tables but have no "Create" button or form.
2. Have no "Edit" action on table rows (no pencil/edit icon).
3. Have no "Delete" action or confirmation dialog.
4. Use shared components that were implemented without mutation capabilities.

The underlying backend microservices (`Users`, `Delivery`, `Billing`, `Stock`) likely already expose CRUD REST endpoints (GET, POST, PATCH, DELETE) — the frontend simply doesn't call them with non-GET methods from the admin pages.

Alternatively, some endpoints may exist only for specific roles or may not be exposed through the Gateway for admin use.

## Resolution Strategy

### 1. Audit Existing Backend Endpoints

Check each backend service for existing CRUD endpoints:

```
GET    /api/{entity}       — List all
GET    /api/{entity}/:id   — Get one
POST   /api/{entity}       — Create
PATCH  /api/{entity}/:id   — Update
DELETE /api/{entity}/:id   — Delete
```

**Files to check:**
- `packages/backend/users/src/*.controller.ts`
- `packages/backend/delivery/src/*.controller.ts`
- `packages/backend/billing/src/*.controller.ts`
- `packages/backend/stock/src/*.controller.ts`
- `packages/backend/gateway/src/routes/*.ts` (route proxying)

For any missing endpoints, implement them following the existing pattern.

### 2. Create Shared CRUD Components

**Files:** `packages/frontend/components/admin/`

Build reusable components to avoid duplicating CRUD logic for each entity:

- `AdminTable.vue` — Generic data table with columns, sorting, pagination, action slots.
- `AdminCreateModal.vue` — Modal dialog with a dynamic form for creating entities.
- `AdminEditModal.vue` — Modal dialog with pre-filled form for editing entities.
- `AdminDeleteDialog.vue` — Confirmation dialog with "Are you sure?" and optional reason field.

Each modal should accept:
- `entity` (string) — entity type name
- `fields` (array) — field definitions (name, label, type, required, validation)
- `apiEndpoint` (string) — base API URL
- `onSuccess` (callback) — refresh table after mutation

### 3. Implement Per-Entity CRUD Pages

For each entity, add a create/edit/delete flow:

| Entity | Fields | Backend Service |
|--------|--------|----------------|
| **Deliveries** | customer, pickup address, delivery address, parcels, driver, scheduled_at | `delivery` |
| **Parcels** | label, weight, dimensions, delivery | `delivery` (or `stock`) |
| **Customers** | name, email, phone, address, hub | `users` (or `delivery`) |
| **Invoices** | customer, deliveries, service_type, priority | `billing` |
| **Drivers** | user_id, license_number, phone, hub | `users` |
| **Vehicles** | plate, model, capacity, hub | `users` (or `delivery`) |
| **Users** | email, password, role, hub, status | `users` |
| **Hubs** | name, city, address, status | `users` |

For each entity page under `pages/admin/`:
- Add a "Create" button above the table → opens `AdminCreateModal`.
- Add "Edit" icon on each row → opens `AdminEditModal`.
- Add "Delete" icon on each row → opens `AdminDeleteDialog`.

### 4. Role & Permission Checks

- Ensure only users with `role: admin` can access these mutation features.
- Add guards on backend endpoints to restrict mutations to admin role.
- Frontend: conditionally show CRUD buttons based on `useAuth().user.role === 'admin'`.

### 5. Form Validation

- Add required field validation on create/edit forms.
- Add confirmation step for delete operations.
- Display API error messages in toast notifications on failure.

### 6. Creation from Invoice (Error #13)

The specific case "Impossible de créer une livraison à partir d'une facture depuis les pages administrateurs" requires:
- An action button on the invoice detail page: "Créer une livraison".
- Calls `POST /invoices/{id}/create-delivery` or similar.
- Pre-fills customer and address from the invoice.
- Returns the created delivery linked to the invoice.

## Priority

**High** — Admin users cannot manage any entity in the system. This entirely blocks the administrative workflow.

## Files Changed (estimated)

- `packages/frontend/components/admin/AdminTable.vue` (new)
- `packages/frontend/components/admin/AdminCreateModal.vue` (new)
- `packages/frontend/components/admin/AdminEditModal.vue` (new)
- `packages/frontend/components/admin/AdminDeleteDialog.vue` (new)
- `packages/frontend/pages/admin/livraisons.vue`
- `packages/frontend/pages/admin/colis.vue`
- `packages/frontend/pages/admin/clients.vue`
- `packages/frontend/pages/admin/factures.vue`
- `packages/frontend/pages/admin/chauffeurs.vue`
- `packages/frontend/pages/admin/vehicules.vue`
- `packages/frontend/pages/admin/utilisateurs.vue`
- `packages/frontend/pages/admin/hubs.vue`
- `packages/backend/*/src/*.controller.ts` (if endpoints missing)
- `packages/backend/gateway/src/routes/*.ts` (if routes missing)
