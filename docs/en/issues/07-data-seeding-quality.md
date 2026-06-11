# Issue: Data Seeding Quality

## Symptoms

- **#5** — The seeder data provided with the application is insufficient and not adapted to a French logistics company:
  - Generic (non-French) addresses that don't correspond to real French cities.
  - Phone numbers not in French format (e.g., `+33 6 xx xx xx xx`).
  - Company named "Transvirex" with a `transvirex.com` domain, but the data doesn't reflect a realistic French logistics business.
  - Missing variety in delivery statuses, customer types, and edge-case scenarios.
  - No realistic hub distribution (Paris, Lyon, Marseille, etc.).

**References:**
- `docs/fr/Liste erreurs.md` — Error #5
- `docs/en/MANUAL_TESTING.md` — Prerequisites section (database seeded with test data)
- `docs/en/NEEDS_ANALYSIS.md` — French logistics context (regional transport, multi-hub operations)

## Root Cause Analysis

The Prisma seed file (`packages/backend/prisma/seed.ts` or equivalent) was written with placeholder data during initial development:

1. **Addresses** — Generated using a generic function that produces non-realistic addresses (e.g., `123 Main St` instead of `12 Rue de la Paix, 75001 Paris`).
2. **Phone numbers** — Hardcoded US-format numbers or random digits without the French `+33` prefix.
3. **Company data** — The company context (French logistics) was not considered when creating test customers, drivers, and hubs.
4. **Missing scenarios** — The seed data covers only the happy path (all deliveries completed). It doesn't include delayed, blocked, or cancelled deliveries, which are needed for testing edge cases and dashboard visuals.

## Resolution Strategy

### 1. Realistic French Address Generator

**Files:** `packages/backend/prisma/seed.ts` (or `packages/backend/prisma/seed/addresses.ts`)

Create a lookup table of real French cities and streets:

```typescript
const FRENCH_CITIES = [
  { city: 'Paris', postalCode: '75001', lat: 48.8566, lng: 2.3522 },
  { city: 'Lyon', postalCode: '69001', lat: 45.7640, lng: 4.8357 },
  { city: 'Marseille', postalCode: '13001', lat: 43.2965, lng: 5.3698 },
  { city: 'Lille', postalCode: '59000', lat: 50.6292, lng: 3.0573 },
  { city: 'Bordeaux', postalCode: '33000', lat: 44.8378, lng: -0.5792 },
  { city: 'Toulouse', postalCode: '31000', lat: 43.6047, lng: 1.4442 },
  { city: 'Nantes', postalCode: '44000', lat: 47.2184, lng: -1.5536 },
  { city: 'Strasbourg', postalCode: '67000', lat: 48.5734, lng: 7.7521 },
  { city: 'Montpellier', postalCode: '34000', lat: 43.6108, lng: 3.8767 },
  { city: 'Rennes', postalCode: '35000', lat: 48.1173, lng: -1.6778 },
]

const FRENCH_STREETS = [
  'Rue de la Paix', 'Avenue des Champs-Élysées', 'Boulevard Saint-Germain',
  'Rue du Faubourg Saint-Honoré', 'Place de la République', 'Cours Mirabeau',
  'Rue de la République', 'Avenue Jean Jaurès', 'Place Bellecour',
  'Boulevard Haussmann', 'Rue Victor Hugo', 'Avenue de la Libération',
]
```

Randomly combine a city + street + random number to generate realistic addresses.

### 2. French Phone Numbers

Generate numbers in French format:

```typescript
function generateFrenchPhone(): string {
  const prefix = ['06', '07'][Math.floor(Math.random() * 2)]
  const rest = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('')
  return `+33 ${prefix} ${rest.slice(0, 2)} ${rest.slice(2, 4)} ${rest.slice(4, 6)} ${rest.slice(6, 8)}`
}
// Example: +33 6 12 34 56 78
```

### 3. Realistic Hub Distribution

Create hubs in major French logistics regions:

| Hub Name | City | Drivers | Description |
|----------|------|---------|-------------|
| Hub Paris-Nord | Paris | 5 | Main hub, Île-de-France |
| Hub Lyon-Est | Lyon | 3 | Auvergne-Rhône-Alpes |
| Hub Marseille-Sud | Marseille | 2 | Provence-Alpes-Côte d'Azur |
| Hub Lille-Nord | Lille | 2 | Hauts-de-France |
| Hub Bordeaux-Ouest | Bordeaux | 2 | Nouvelle-Aquitaine |

### 4. Realistic Customer Data

- French company names: `SARL Dupont Logistique`, `SuperMarché Express`, `Boulangerie Artisanale`, `Clinique Saint-Joseph`, `Mairie de Lyon`, etc.
- Mix of B2B and B2C customers.
- Customers with multiple deliveries (for invoice testing).

### 5. Diverse Delivery Scenarios

Include deliveries in various statuses:

| Status | Count | Purpose |
|--------|-------|---------|
| `Planned` | 5 | Current missions visible to drivers |
| `Delivering` | 3 | In-progress deliveries |
| `Delivered` | 10 | Completed (for history/invoicing) |
| `Cancelled` | 2 | Cancelled missions |
| `Delayed` | 1 | Past-schedule delivery |
| `Blocked` | 1 | Incident-reported delivery |

Include deliveries with varied:
- Parcel counts (1–5 parcels per delivery).
- Weights (1kg to 500kg).
- Priorities (`standard`, `express`, `urgent`).

### 6. User Accounts for All Roles

Ensure test credentials from `MANUAL_TESTING.md` work:

```typescript
const TEST_USERS = [
  { email: 'admin@transvirex.local', role: 'admin', password: 'password' },
  { email: 'dispatcher@transvirex.local', role: 'dispatcher', password: 'password' },
  { email: 'driver@transvirex.local', role: 'driver', password: 'password' },
  { email: 'billing@transvirex.local', role: 'business_manager', password: 'password' },
]
```

Each user should have realistic profile data (French name, phone, hub assignment).

### 7. Run Seeder Safely

Add idempotency to the seed script:
- Use `prisma.upsert` instead of `prisma.create` for key entities.
- Clear existing data before seeding in development environments.

## Priority

**Medium** — Poor seed data doesn't block development but makes manual testing unreliable and demo presentations unprofessional.

## Files Changed (estimated)

- `packages/backend/prisma/seed.ts` (or `packages/backend/prisma/seed/`)
