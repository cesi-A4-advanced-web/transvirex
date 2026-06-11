# Issue: Infrastructure & Caching

## Symptoms

- **#33** — No Redis caching is implemented anywhere in the application. Every request hits the database directly, even for frequently accessed, slowly changing data.
- **#34** — No real-time driver tracking in Redis. The architecture document specifies Redis for "session cache, rate limiting, real-time flags," but only session/token storage is used.

**References:**
- `docs/fr/Liste erreurs.md` — Errors #33, #34
- `docs/en/ARCHITECTURE.md` — Redis for cache/sessions, microservices with Redis dependency
- `docs/en/MANUAL_TESTING.md` — Section 7.5 (Debug & Monitoring — Redis key browser)

## Root Cause Analysis

1. **No caching strategy** — The NestJS services (`authentication`, `delivery`, `billing`, `users`) connect to Redis (via `ioredis`), but they only use it for storing JWT refresh tokens and possibly rate-limiting data. No application-level caching (database query results, computed aggregates) is implemented.

2. **Caching libraries not configured** — NestJS `@nestjs/cache-manager` with Redis store may not be set up. The `cache-manager` package or `nestjs-cache` is likely not imported in the service modules.

3. **No real-time tracking** — The `delivery` service doesn't publish driver locations to Redis, and the `gateway` doesn't expose them via the API.

## Resolution Strategy

### 1. Set Up Cache Module

**Files:** `packages/backend/lib/redis/` (shared library), each service's `app.module.ts`

Install and configure `@nestjs/cache-manager` with Redis store:

```typescript
// In shared library or each service
import { CacheModule } from '@nestjs/cache-manager'
import { redisStore } from 'cache-manager-redis-yet'

CacheModule.registerAsync({
  useFactory: () => ({
    store: await redisStore({
      socket: { host: process.env.REDIS_HOST, port: 6379 },
      ttl: 300, // 5 minutes default TTL
    }),
  }),
})
```

### 2. Identify Cacheable Data

Apply caching to endpoints with high read frequency and low write frequency:

| Endpoint | Strategy | TTL | Invalidation Trigger |
|----------|----------|-----|---------------------|
| `GET /hubs` | Cache all hubs | 1 hour | Hub create/update/delete |
| `GET /users?role=driver` | Cache driver list | 5 min | Driver create/update |
| `GET /delivery/stats` (dashboard cards) | Cache aggregated stats | 2 min | Delivery status change |
| `GET /reports/summary` | Cache by query params | 10 min | New delivery completed |
| `GET /vehicles` | Cache all vehicles | 1 hour | Vehicle create/update/delete |

### 3. Implement Caching in Controllers

**Files:** Each NestJS controller (`packages/backend/*/src/*.controller.ts`)

Use `@UseInterceptors(CacheInterceptor)` for read endpoints:

```typescript
@Get()
@UseInterceptors(CacheInterceptor)
@CacheTTL(60) // override TTL in seconds
async findAll() {
  return this.service.findAll()
}
```

For custom caching logic:

```typescript
@Get('stats')
async getStats(@Query() query) {
  const cacheKey = `delivery:stats:${JSON.stringify(query)}`
  const cached = await this.cacheManager.get(cacheKey)
  if (cached) return cached

  const stats = await this.service.getStats(query)
  await this.cacheManager.set(cacheKey, stats, 120_000) // 2 min
  return stats
}
```

### 4. Cache Invalidation

On mutation endpoints (POST, PATCH, DELETE), invalidate related caches:

```typescript
@Patch(':id')
async update(@Param('id') id: string, @Body() dto) {
  const result = await this.service.update(id, dto)
  // Invalidate caches
  await this.cacheManager.del('delivery:stats')
  await this.cacheManager.del(`delivery:${id}`)
  return result
}
```

### 5. Rate Limiting

If not already configured, add `@nestjs/throttler` with Redis store for distributed rate limiting:

```typescript
// app.module.ts
ThrottlerModule.forRoot({
  throttlers: [{ limit: 100, ttl: 60000 }],
  storage: new ThrottlerStorageRedisService(new Redis(process.env.REDIS_URL)),
})
```

### 6. Real-Time Driver GPS Tracking in Redis

**Files:** `packages/backend/delivery/src/location.controller.ts`, `packages/frontend/composables/useRealtime.ts`

This is a separate concern from caching but uses Redis. See `03-real-time-tracking-and-alerts.md` for full strategy.

Redis key schema for driver locations:

```
driver:{driverId}:location → { lat: number, lng: number, updatedAt: ISO string }
TTL: 300 seconds (5 min — driver is considered offline after this)
```

Operations:
- `SETEX driver:{driverId}:location 300 '{lat,lng,updatedAt}'` — Driver sends location.
- `GET driver:{driverId}:location` — Dispatcher fetches location.
- `KEYS driver:*:location` — Get all active driver locations (use `SCAN` in production).

### 7. Debug Page Integration

Ensure the Redis debug page (`/debug/redis`) shows:
- Connected/not connected status.
- Key count (approximate).
- Key browser (list keys by pattern).
- Cache hit/miss metrics (if available from cache manager).

## Priority

**Low** — Redis caching is an optimization, not a blocker. Implement after all functional issues are resolved. Rate limiting is more critical for production security.

## Files Changed (estimated)

- `packages/backend/lib/redis/` — cache manager setup
- `packages/backend/delivery/src/*.controller.ts` — add caching
- `packages/backend/users/src/*.controller.ts` — add caching
- `packages/backend/billing/src/*.controller.ts` — add caching
- `packages/backend/authentication/src/*.controller.ts` — add rate limiting
- `packages/backend/delivery/src/location.controller.ts` — GPS tracking
