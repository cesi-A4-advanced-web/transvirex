import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { RabbitMQModule } from '@app/rabbitmq';
import { MongoDBModule } from '@app/mongodb';
import { GuardsModule } from '@app/guards';
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
