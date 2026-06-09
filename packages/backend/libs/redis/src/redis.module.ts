import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

/** Global module providing the RedisService throughout the application. */
@Global()
@Module({
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisModule {}
