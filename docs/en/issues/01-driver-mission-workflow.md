# Issue: Driver Mission Workflow

## Symptoms

- **2.1 KO** — The driver's daily route page shows deliveries but lacks detailed information (parcel contents, addresses, contact details)
- **2.2 KO** — No "Accept" / "Decline" buttons are displayed on pending deliveries. Drivers have no way to formally accept or refuse a mission. No notification is sent when a new mission is assigned.
- **2.3 KO** — No completion button ("Livré") on deliveries in "Delivering" status. No incident reporting button. No photo/comment fields.
- **2.4 KO** — Incident reporting is only possible through the AI Assistant chat, not through a dedicated UI button on the delivery detail page.
- **2.5 KO** — The mission history page has no detail view per delivery, no delivery event timeline, and no date or status filters.

**References:**
- `docs/fr/Liste erreurs.md` — Errors #24, #25, #26
- `docs/fr/Etat tests manuels.md` — Sections 2.1, 2.2, 2.3, 2.4, 2.5
- `docs/en/MANUAL_TESTING.md` — Section 2 (Driver — Delivery Person)
- `docs/en/NEEDS_ANALYSIS.md` — Driver needs: view daily route, accept/decline missions, report completion/incidents, view mission history

## Root Cause Analysis

The driver frontend pages (`pages/livreur/*`) lack several critical components:

1. **Mission detail panel** (`pages/livreur/livraison.vue` or similar) — Shows only a basic list without expandable details or a modal for parcel contents, addresses, contacts.

2. **Accept/Decline actions** — No API call buttons wired to the delivery status transition endpoints. The UI likely renders a read-only list of deliveries without action controls.

3. **Completion / incident reporting** — The `DeliveryEvent` model exists in the database schema, and the backend likely supports creating events, but the frontend has no UI to trigger them (except through the AI assistant).

4. **Notifications** — The RabbitMQ infrastructure is in place (delivery.* exchange, queues), but the frontend has no WebSocket or polling consumer to receive and display real-time notifications for mission assignment or status changes.

5. **History page** — No dedicated "Historique" page or component with filtering logic. The existing delivery list probably shows only current deliveries without pagination or search.

## Resolution Strategy

### 1. Delivery Detail Component

**Files:** `packages/frontend/pages/livreur/livraison.vue` (or a dedicated component)

- Create a reusable `DriverDeliveryDetail` component with:
  - Delivery reference, status badge, scheduled time
  - Pickup and delivery addresses (from the `Address` model)
  - Parcel list (label, weight, dimensions)
  - Customer name and contact info
  - Timeline of `DeliveryEvent` entries
- Open it as a slide-over panel or modal when clicking a delivery row.
- Add a "See timeline" expandable section.

### 2. Accept / Decline Buttons

**Files:** `packages/frontend/pages/livreur/livraison.vue`, `packages/frontend/composables/useApi.ts`

- Add conditional action buttons:
  - Show "Accepter" / "Refuser" when `status === 'Planned'`
  - Show "Livré" when `status === 'Delivering'`
- Wire buttons to `PATCH /delivery/{id}/status` via `useApi` composable.
- On accept → status `Planned` → `Delivering`
- On decline → status `Planned` → `Cancelled` (with optional reason field)
- After action, refresh the delivery list and emit a success toast.

### 3. Delivery Completion & Incident Reporting

**Files:** `packages/frontend/pages/livreur/livraison.vue`

- Add "Livré" button with optional photo file input and comment textarea.
- Add "Signaler un incident" button that opens a form:
  - Incident type select: `retard`, `casse`, `adresse erronée`, `autre`
  - Description textarea
  - Optional photo attachment
- On submit → `POST /delivery/{id}/events` with `type: "incident"` or `type: "info"`.
- Connect to the backend `DeliveryEvent` endpoint (likely in `packages/backend/delivery/`).

### 4. Real-time Notifications for Drivers

**Files:** `packages/frontend/composables/useNotifications.ts`, `packages/frontend/stores/notification.ts`

- Implement a composable `useNotifications` that consumes RabbitMQ events (via WebSocket bridge or SSE from the gateway).
- Show a toast/badge when:
  - A new mission is assigned (`Nouvelle mission assignée`)
  - A mission is reassigned/removed (`Mission LIV-XXX retirée`)
- Store unread count in a Pinia store, display badge in the sidebar.

### 5. Mission History Page

**Files:** `packages/frontend/pages/livreur/historique.vue`

- Create or enhance a dedicated history page with:
  - Filter by date range (date picker)
  - Filter by status (`Delivered`, `Cancelled`, `Delayed`, `Blocked`)
  - Click on a row → open the `DriverDeliveryDetail` with full event timeline
- API endpoint: `GET /delivery/history?driverId={id}&from=&to=&status=`

### 6. Backend API Verification

**Files:** `packages/backend/delivery/src/*`

- Verify that `PATCH /delivery/{id}/status` accepts transitions: `Planned→Delivering`, `Planned→Cancelled`, `Delivering→Delivered`, `Delivering→Delayed|Blocked`.
- Verify that `POST /delivery/{id}/events` creates a `DeliveryEvent` and emits a RabbitMQ message.
- Add a `GET /delivery/history` endpoint with query filters if missing.

## Priority

**High** — These issues block the core driver workflow (accepting missions, reporting progress), which is the most critical operational flow.

## Files Changed (estimated)

- `packages/frontend/pages/livreur/livraison.vue`
- `packages/frontend/pages/livreur/historique.vue`
- `packages/frontend/composables/useNotifications.ts`
- `packages/frontend/stores/notification.ts`
- `packages/backend/delivery/src/*` (if API endpoints need adding/fixing)
