# Issue: Authentication & Navigation

## Symptoms

- **#4** — After logout, or approximately 2 minutes of inactivity (likely the `ACCESS_TOKEN_TTL` expiry), the user is redirected to the dispatcher dashboard instead of the login page. This suggests a silent token refresh that fails or a redirect logic bug.
- **#23** — The "Profil & Véhicule" button on a driver's page redirects to the dispatcher dashboard instead of displaying the driver's profile and vehicle information.

**References:**
- `docs/fr/Liste erreurs.md` — Errors #4, #23
- `docs/en/MANUAL_TESTING.md` — Section 1.1 (Login Flow), Section 1.2 (Role Isolation)
- `docs/en/ARCHITECTURE.md` — JWT authentication with access + refresh token pair

## Root Cause Analysis

1. **Redirect after logout/token expiry (#4)**: The auth guard middleware in the frontend (`useAuth` composable or Nuxt route middleware) likely:
   - Fails to detect token expiration correctly, or
   - Performs a silent refresh that succeeds but returns a token for a different role (e.g., always defaulting to dispatcher), or
   - The logout function clears tokens but the navigation guard redirects to a hardcoded route (`/dispatcher/dashboard`) instead of the login page.

2. **"Profil & Véhicule" button (#23)**: The button's `@click` handler or `<nuxt-link>` navigates to a wrong route:
   - The route may be hardcoded as `/dispatcher/dashboard` instead of `/livreur/profil`.
   - Or the `to` prop uses a computed value that resolves incorrectly.

## Resolution Strategy

### 1. Fix Logout / Token Expiry Redirect

**Files:** `packages/frontend/composables/useAuth.ts`, `packages/frontend/middleware/auth.ts`

- **Logout flow**: Ensure `logout()` function:
  - Clears access token and refresh token from `localStorage`/`sessionStorage`.
  - Clears Pinia auth store (user, role, permissions).
  - Calls `router.push('/login')` explicitly.
- **Token expiry detection**: In the `useApi` composable or Axios interceptor:
  - On 401 response, check if refresh token exists.
  - If refresh succeeds → retry original request.
  - If refresh fails (expired) → call `logout()` → redirect to `/login`.
- **Navigation guard**: In the Nuxt route middleware:
  - If no token → allow access only to `/login` (redirect all other routes).
  - If token exists but expired and refresh failed → redirect to `/login`.
  - Do NOT hardcode a default role-based redirect.

### 2. Fix "Profil & Véhicule" Button

**Files:** `packages/frontend/pages/livreur/*.vue` (or whichever page contains the button)

- Search for the button text "Profil & Véhicule" in the codebase.
- Verify the `to` or `@click` handler:
  - Should navigate to `/livreur/profil` (driver profile page).
  - Should NOT navigate to `/dispatcher/dashboard`.
- If the driver profile page doesn't exist, create it:
  - Display driver's user info (name, email, phone).
  - Display assigned vehicle details (plate, model).
  - Fetch from `GET /drivers/{id}` (includes vehicle info).

### 3. Verify Role-Based Route Isolation

**Files:** `packages/frontend/middleware/auth.ts`, `packages/backend/gateway/src/guards/*.ts`

- Ensure route middleware checks the user's actual role (from the JWT token) before allowing access.
- Ensure navigating to `/admin/*` as a driver correctly returns 403 or redirects to the driver dashboard.
- Ensure the JWT token payload contains the `role` claim and it's correctly decoded on the frontend.

## Priority

**Medium** — These are usability bugs that confuse users but don't block core workflows. Fix after high-priority items.

## Files Changed (estimated)

- `packages/frontend/composables/useAuth.ts`
- `packages/frontend/middleware/auth.ts`
- `packages/frontend/pages/livreur/*.vue` (profil button)
- `packages/frontend/pages/livreur/profil.vue` (if missing)
