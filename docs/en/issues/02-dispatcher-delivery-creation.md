# Issue: Dispatcher Delivery Creation Form

## Symptoms

- **3.1 KO** — When creating a new delivery from the dispatcher interface:
  - The "Référence livraison" field is required and must be filled manually instead of being auto-generated and read-only.
  - There is no driver selection dropdown to optionally assign a driver at creation time.
  - There is no date/time picker to set a scheduled delivery date.

**References:**
- `docs/fr/Liste erreurs.md` — Errors #27, #28, #29
- `docs/fr/Etat tests manuels.md` — Section 3.1
- `docs/en/MANUAL_TESTING.md` — Section 3.1 (Create and Assign a Mission)
- `docs/en/NEEDS_ANALYSIS.md` — Dispatcher need: create and assign missions to drivers

## Root Cause Analysis

The delivery creation form (`pages/dispatcher/nouvelle-livraison.vue` or similar) was implemented with incomplete fields:

1. **Reference field** — The form uses a plain text input for `reference` instead of auto-generating it server-side (e.g., `LIV-{auto-increment}` or UUID-based). The backend likely generates a reference on creation, but the frontend still requires manual input.

2. **Driver assignment** — The form lacks a `<select>` dropdown populated with available drivers. The backend `POST /delivery` endpoint might accept a `driverId` parameter, but the frontend doesn't expose it.

3. **Date picker** — No `<input type="datetime-local">` or similar date picker component for `scheduled_at`. The field is either missing or not wired to the API payload.

## Resolution Strategy

### 1. Auto-generate Reference

**Files:** `packages/frontend/pages/dispatcher/nouvelle-livraison.vue`

- Remove the manual `reference` input field.
- Display an auto-generated reference in a read-only field (e.g., `<input disabled :value="generatedReference" />`).
- Generate the reference client-side as a temporary placeholder (`LIV-{timestamp}`) or fetch a reference prefix from the backend.
- The backend should also generate/finalize the reference upon creation (`POST /delivery`).

**Backend** (`packages/backend/delivery/src/`):
- Ensure the delivery creation endpoint auto-generates a unique reference when none is provided.
- Format: `LIV-{YYYYMMDD}-{XXXX}` where XXXX is a sequential number or random string.

### 2. Driver Selection Dropdown

**Files:** `packages/frontend/pages/dispatcher/nouvelle-livraison.vue`

- Add a `<select>` or combobox component for driver selection:
  - Fetch available drivers from `GET /users?role=driver&status=active`.
  - Display as `{firstName} {lastName} — {hub}`.
  - Add an empty option for "Non assigné" (assignment is optional at creation).
- Wire the selected `driverId` to the API payload.

**Backend** (`packages/backend/delivery/src/`):
- Verify `POST /delivery` accepts an optional `driverId` field.
- If provided, set the delivery status to `Planned` and emit a RabbitMQ event for the driver's notification queue.

### 3. Date/Time Picker

**Files:** `packages/frontend/pages/dispatcher/nouvelle-livraison.vue`

- Add a `<input type="datetime-local">` for the `scheduled_at` field.
- Make it optional (deliveries can be created without a scheduled date and assigned later).
- Wire to `scheduled_at` in the API payload (ISO 8601 format).

### 4. Create & Assign Button

- Rename the submit button to "Créer et assigner" when a driver is selected.
- Add a secondary "Créer (sans assigner)" button for draft creation.
- After creation:
  - If assigned → status `Planned`, driver receives notification.
  - If unassigned → status `Draft` or `Pending`, visible in dispatcher's unassigned list.

## Priority

**High** — The delivery creation form is the primary dispatcher action. Missing fields block the ability to properly assign and schedule deliveries.

## Files Changed (estimated)

- `packages/frontend/pages/dispatcher/nouvelle-livraison.vue`
- `packages/backend/delivery/src/*` (reference auto-generation, driverId validation)
