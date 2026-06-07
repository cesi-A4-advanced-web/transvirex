import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
const REDIS_DB = Number(process.env.REDIS_DB) || 0;

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

    async onModuleDestroy() {
        await this.client.quit();
    }

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
