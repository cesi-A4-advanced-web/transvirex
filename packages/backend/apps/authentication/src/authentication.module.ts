import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@app/database';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import Redis from 'ioredis';

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

@Module({
    imports: [
        DatabaseModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'dev_secret',
            signOptions: { expiresIn: '15m' },
        }),
    ],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, RedisProvider],
})
export class AuthenticationModule {}
