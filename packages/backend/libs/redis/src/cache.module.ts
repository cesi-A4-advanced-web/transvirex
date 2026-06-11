import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
const REDIS_DB = Number(process.env.REDIS_DB) || 0;

@Global()
@Module({
    imports: [
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async () => ({
                store: await redisStore({
                    socket: {
                        host: REDIS_HOST,
                        port: REDIS_PORT,
                    },
                    password: REDIS_PASSWORD || undefined,
                    database: REDIS_DB,
                    ttl: 300_000,
                }),
            }),
        }),
    ],
    exports: [CacheModule],
})
export class CacheConfigModule {}
