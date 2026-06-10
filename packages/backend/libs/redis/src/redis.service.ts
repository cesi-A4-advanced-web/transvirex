import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

/** Redis connection credentials (from environment or defaults). */
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
const REDIS_DB = Number(process.env.REDIS_DB) || 0;

/** Service wrapping an ioredis client for executing commands from the debug endpoints. */
@Injectable()
export class RedisService implements OnModuleDestroy {
    private client: Redis;

    constructor() {
        this.client = new Redis({
            host: REDIS_HOST,
            port: REDIS_PORT,
            password: REDIS_PASSWORD || undefined,
            db: REDIS_DB,
            lazyConnect: true,
        });
    }

    /** Quit the Redis connection on module destroy. */
    async onModuleDestroy() {
        await this.client.quit();
    }

    /** Set a key with an optional TTL (in seconds). */
    async set(key: string, value: string, ttl?: number): Promise<'OK'> {
        if (ttl) {
            return this.client.set(key, value, 'EX', ttl);
        }
        return this.client.set(key, value);
    }

    /** Get the value of a key. Returns null if the key does not exist. */
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    /** Delete one or more keys. */
    async del(...keys: string[]): Promise<number> {
        return this.client.del(...keys);
    }

    /** Parse and execute a Redis command string, returning tabular results. */
    async executeCommand(command: string): Promise<{ columns: string[]; rows: any[]; rowCount: number }> {
        const trimmed = command.trim();
        const parts = trimmed.split(/\s+/);
        const cmd = parts[0]?.toUpperCase();
        const args = parts.slice(1);

        const result = await this.client.call(cmd, ...args);
        const normalized = Array.isArray(result) ? result : [result];

        const rows = normalized.map((item: any) => ({
            value: item != null ? String(item) : 'nil',
        }));

        return {
            columns: ['value'],
            rows,
            rowCount: rows.length,
        };
    }
}
