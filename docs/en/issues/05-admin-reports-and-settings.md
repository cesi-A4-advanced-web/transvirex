# Issue: Admin Reports & Settings

## Symptoms

- **5.2 KO** — On the admin "Rapports" page:
  - No filter by driver or by hub.
  - The export button (PDF) does not work.
- **#22** — The "Settings" / "Paramétrage" page in the admin interface is non-functional. It should either be removed, or kept in read-only/consultation mode only.
- **#31** — Export button in reports is completely non-functional.
- **#32** — No filter capabilities (driver, hub, date range) in the reports page.

**References:**
- `docs/fr/Liste erreurs.md` — Errors #22, #31, #32
- `docs/fr/Etat tests manuels.md` — Section 5.2
- `docs/en/MANUAL_TESTING.md` — Section 5.2 (Performance Analysis)
- `docs/en/NEEDS_ANALYSIS.md` — Management needs: performance analysis, identify overload/under-utilization

## Root Cause Analysis

1. **Reports page** (`pages/admin/rapports.vue`) — The page likely renders a static or hardcoded table with no interactive filter controls. The export button may trigger a function that either:
   - Calls a non-existent backend endpoint.
   - Uses `jsPDF` on the frontend but the implementation is incomplete or broken.
   - Is not wired to any click handler.

2. **Settings page** (`pages/admin/parametres.vue`) — The page may load empty, display a placeholder, or throw errors. It may have been scaffolded but never implemented.

3. **Filter drivers** — The report data is fetched without query parameters for filtering. The backend may accept filter parameters but the frontend doesn't send them.

## Resolution Strategy

### 1. Fix or Remove Settings Page

**Files:** `packages/frontend/pages/admin/parametres.vue`

Option A (recommended): Convert to a read-only configuration display:
- Show current system configuration (app version, service status, environment variables — non-sensitive only).
- No edit/save functionality.
- Add a banner: "Page en consultation uniquement — les modifications ne sont pas encore disponibles."

Option B: Remove the page entirely:
- Delete the route from the sidebar navigation.
- Return a 404 or redirect to the admin dashboard.

### 2. Implement Report Filters

**Files:** `packages/frontend/pages/admin/rapports.vue`

Add filter controls above the report table:

- **Driver filter**: `<select>` populated from `GET /users?role=driver`. Multi-select or single-select.
- **Hub filter**: `<select>` populated from `GET /hubs`. Multi-select or single-select.
- **Date range**: Start date + end date inputs.
- **Status filter**: Checkboxes for delivery statuses.
- **Report type**: Radio buttons for "Par chauffeur", "Par hub", "Par région".

Fetch filtered data from `GET /reports?driverId=&hubId=&from=&to=&status=`. If the backend endpoint doesn't support filtering, add query parameters to the existing report endpoint.

### 3. Fix Export to PDF

**Files:** `packages/frontend/pages/admin/rapports.vue`, `packages/frontend/composables/usePdfExport.ts`

**Approach A — Frontend-side PDF generation:**
- Use `jsPDF` (already in dependencies per `docs/en/ARCHITECTURE.md`).
- Generate PDF from the currently displayed (filtered) table data.
- Include: title, date range, table headers, row data, summary totals.
- Add a "Export PDF" button that triggers generation and triggers a download.

**Approach B — Backend-side PDF generation:**
- `POST /reports/export` with filter parameters in the body.
- Backend generates the PDF using a NestJS PDF library (e.g., `pdfkit` or `puppeteer`).
- Returns the PDF as a file download stream.
- Frontend triggers download via `window.open` or a hidden anchor.

**Recommendation**: Start with Approach A (frontend-only, no backend changes needed) as a quick fix. Migrate to Approach B later if server-side generation is needed for larger datasets.

### 4. Report Data Endpoint

**Files:** `packages/backend/delivery/src/reports.controller.ts` (or equivalent)

If no reports endpoint exists:
- Implement `GET /reports/summary?from=&to=&driverId=&hubId=`
- Return aggregated data: total deliveries, on-time %, avg delay, total revenue, by-driver breakdown.
- Implement `GET /reports/by-driver?from=&to=&hubId=`
- Return per-driver stats: name, deliveries completed, avg time, incidents count.
- Implement `GET /reports/by-hub?from=&to=`
- Return per-hub aggregated metrics.

## Priority

**Medium** — Reports are important for management analysis, but the core delivery/invoicing workflows are higher priority. The settings page is low priority.

## Files Changed (estimated)

- `packages/frontend/pages/admin/rapports.vue`
- `packages/frontend/pages/admin/parametres.vue`
- `packages/frontend/composables/usePdfExport.ts`
- `packages/backend/delivery/src/reports.controller.ts` (if endpoint needs fixing)
