import { DatabaseModule } from '@app/database';
import { GuardsModule } from '@app/guards';
import { LoggingModule } from '@app/logging';
import { MongoDBModule } from '@app/mongodb';
import { RabbitMQModule } from '@app/rabbitmq';
import { RedisModule } from '@app/redis';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
    imports: [
        GuardsModule,
        DatabaseModule,
        RedisModule,
        RabbitMQModule,
        MongoDBModule,
        JwtModule.register({}),
        LoggingModule,
    ],
    controllers: [GatewayController],
    providers: [
        GatewayService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class GatewayModule {}
