import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@app/database';
import { LoggingModule } from '@app/logging';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import Redis from 'ioredis';

/** Provider factory for a Redis connection used to store refresh tokens. */
const RedisProvider = {
    provide: 'REDIS',
    useFactory: () =>
        new Redis({
            host: process.env.REDIS_HOST || 'redis',
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || 'redis_password',
            db: Number(process.env.REDIS_DB) || 0,
        }),
};

/** Root module for the authentication microservice. */
@Module({
    imports: [
        LoggingModule,
        DatabaseModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: (process.env.JWT_ACCESS_TTL ? `${process.env.JWT_ACCESS_TTL}s` : '180s') as any },
        }),
    ],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, RedisProvider],
})
export class AuthenticationModule {}
