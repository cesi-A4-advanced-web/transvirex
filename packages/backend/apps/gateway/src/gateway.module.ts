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
import { JwtAuthGuard } from '../../../libs/guards/src/jwt-auth.guard';
import { AiController } from './controllers/ai.controller';
import { AuthController } from './controllers/auth.controller';
import { BillingController } from './controllers/billing.controller';
import { CustomersController } from './controllers/customers.controller';
import { DebugController } from './controllers/debug.controller';
import { DeliveriesController } from './controllers/deliveries.controller';
import { HealthController } from './controllers/health.controller';
import { HubsController } from './controllers/hubs.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { LoggingController } from './controllers/logging.controller';
import { UsersController } from './controllers/users.controller';
import { VehiclesController } from './controllers/vehicles.controller';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

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
    controllers: [
        GatewayController,
        HealthController,
        AuthController,
        BillingController,
        CustomersController,
        AiController,
        DebugController,
        DeliveriesController,
        HubsController,
        LoggingController,
        UsersController,
        VehiclesController,
        InvoicesController,
    ],
    providers: [
        GatewayService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class GatewayModule {}
