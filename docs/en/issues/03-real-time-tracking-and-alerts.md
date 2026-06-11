# Issue: Real-Time Tracking & Alerts

## Symptoms

- **3.2 KO** — The dispatcher's "Livraisons en cours" page does not update in real time. Status changes (driver accepts, delivers, reports incident) only appear after a manual page refresh.
- **3.4 KO** — No alert notifications appear in the dispatcher UI when a driver reports an incident or a delivery passes its scheduled time.
- **6.4 KO** — Smart notifications (mission assigned, mission removed) are not delivered to drivers' UIs.
- **#1** — After creating a delivery from an invoice, the delivery has no visible status on the interface, even after assigning a driver.
- **#34** — No real-time GPS tracking of drivers in Redis.

**References:**
- `docs/fr/Liste erreurs.md` — Errors #1, #30, #34
- `docs/fr/Etat tests manuels.md` — Sections 3.2, 3.4, 6.4
- `docs/en/MANUAL_TESTING.md` — Sections 3.2, 3.4, 6.4, 7.4 (RabbitMQ Event Propagation)
- `docs/en/ARCHITECTURE.md` — RabbitMQ event-driven communication pattern

## Root Cause Analysis

The RabbitMQ infrastructure is in place (exchanges, queues), but the frontend has no consumer to receive and display messages in real time:

1. **No WebSocket/SSE bridge** — The gateway does not expose a WebSocket or Server-Sent Events endpoint that the frontend can subscribe to for real-time events. The frontend relies entirely on REST polling, which is not implemented either.

2. **No notification Pinia store** — There is no client-side state management for notifications (unread count, toast queue, notification list).

3. **Delivery status not displayed** — When creating a delivery from an invoice (`POST /invoice/{id}/createDelivery`), the returned delivery object may not include the `status` field, or the frontend doesn't render it.

4. **GPS tracking not wired** — Redis is available but no location data is being published by drivers' mobile devices or consumed by the dispatcher dashboard.

## Resolution Strategy

### 1. WebSocket / SSE Bridge for Real-Time Events

**Files:** `packages/backend/gateway/src/*`, `packages/frontend/composables/useRealtime.ts`

Implement a WebSocket gateway that subscribes to RabbitMQ queues and forwards messages to authenticated clients:

- In the NestJS Gateway service, add a `@WebSocketGateway()` that:
  - Authenticates connections via JWT token (handshake).
  - Subscribes to `delivery.*`, `incident.*`, `notification.*` RabbitMQ exchanges.
  - Forwards relevant messages to connected clients based on their role and hub.
- On the frontend, create a `useRealtime` composable that:
  - Opens a WebSocket connection to `wss://transvirex.local/ws`.
  - Dispatches events to the relevant Pinia stores.
  - Handles reconnection with exponential backoff.

**Alternative** (simpler): Implement Server-Sent Events (SSE) instead of WebSocket:
- Gateway exposes `GET /events` endpoint that streams events.
- Frontend uses `EventSource` API to consume them.
- Use Redis Pub/Sub to broadcast events across gateway instances.

### 2. Notification System

**Files:** `packages/frontend/stores/notification.ts`, `packages/frontend/composables/useNotifications.ts`

Create a notification system:

- **Pinia store** (`notification.ts`):
  - `notifications[]` — list of notification objects (id, type, message, deliveryId, read, timestamp)
  - `unreadCount` — computed from unread notifications
  - Actions: `pushNotification`, `markAsRead`, `clearAll`
- **Toast display**: Show a toast for each new notification (configurable duration).
- **Badge**: Display unread count in the sidebar nav.
- **Notification panel**: Clickable bell icon opens a dropdown with recent notifications.

### 3. Fix Delivery Status Display (Issue #1)

**Files:** `packages/frontend/pages/admin/livraisons.vue`

- When a delivery is created from an invoice, ensure the API response includes the `status` field.
- Render the status as a colored badge in the delivery list.
- After assigning a driver (`PATCH /delivery/{id}/assign`), refresh the delivery row to show updated status.

### 4. Real-Time GPS Tracking (Issue #34)

**Files:** `packages/backend/delivery/src/*`, `packages/frontend/pages/dispatcher/dashboard.vue`

- **Backend**: Create a `POST /delivery/{id}/location` endpoint that accepts `{ lat, lng, timestamp }` and stores the latest position in Redis with a 5-minute TTL.
- **Redis key schema**: `driver:{driverId}:location` → `{ lat, lng, updatedAt }`
- **Frontend**: On the dispatcher dashboard, add a map component (Leaflet/Mapbox) showing driver markers that update via WebSocket.
- **Mobile**: When accessed from a mobile browser, use the Geolocation API to send periodic location updates.

### 5. Alert on Delay / Anomaly (Section 3.4)

- Leverage the notification system (step 2) to display alerts for:
  - Delivery past scheduled time without completion.
  - Driver-reported incidents (auto-escalate to dispatcher).
- Add a dispatcher alert panel on the dashboard with:
  - Red/orange badges for delayed/blocked deliveries.
  - Click navigates to the specific delivery detail.

### 6. RabbitMQ Verification (Section 7.4)

**Files:** `packages/backend/delivery/src/*`, `packages/backend/authentication/src/*`, `packages/backend/billing/src/*`

- Verify that all services publish messages to RabbitMQ on status transitions:
  - Delivery: `delivery.status.updated` exchange
  - Incident: `incident.alerts` queue
  - Notification: `notification.*` exchange
- Verify that queues are bound correctly in RabbitMQ management UI.

## Priority

**High** — Real-time tracking and alerts are critical for dispatchers to monitor operations. Without them, the platform provides no advantage over phone/WhatsApp communication.

## Files Changed (estimated)

- `packages/backend/gateway/src/ws/` — WebSocket gateway
- `packages/frontend/composables/useRealtime.ts`
- `packages/frontend/stores/notification.ts`
- `packages/frontend/composables/useNotifications.ts`
- `packages/frontend/pages/dispatcher/dashboard.vue`
- `packages/frontend/pages/admin/livraisons.vue`
- `packages/backend/delivery/src/location.controller.ts`
