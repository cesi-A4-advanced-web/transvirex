import { DatabaseModule } from '@app/database';
import { GuardsModule } from '@app/guards';
import { LoggingModule } from '@app/logging';
import { MongoDBModule } from '@app/mongodb';
import { RabbitMQModule } from '@app/rabbitmq';
import { RedisModule } from '@app/redis';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './controllers/auth.controller';
import { DebugController } from './controllers/debug.controller';
import { HealthController } from './controllers/health.controller';
import { LoggingController } from './controllers/logging.controller';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/** Root module for the API gateway microservice. */
@Module({
    imports: [
        GuardsModule,
        DatabaseModule,
        RedisModule,
        RabbitMQModule,
        MongoDBModule,
        JwtModule.register({}),
        LoggingModule,
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }]),
    ],
    controllers: [GatewayController, HealthController, AuthController, DebugController, LoggingController],
    providers: [
        GatewayService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class GatewayModule {}
