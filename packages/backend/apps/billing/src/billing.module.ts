import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@app/database';
import { LoggingModule } from '@app/logging';
import { CacheConfigModule, RedisModule } from '@app/redis';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

/**
 * Root module for the billing microservice.
 * Handles invoice confirmation, delivery.status_changed event consumption,
 * and emits delivery.created events for the delivery service.
 */
@Module({
    imports: [
        RedisModule,
        CacheConfigModule,
        DatabaseModule,
        LoggingModule,
        ClientsModule.register([
            {
                name: 'RMQ_CLIENT',
                transport: Transport.RMQ,
                options: {
                    urls: [
                        `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || 5672}`,
                    ],
                    queue: 'billing_queue',
                    queueOptions: {
                        durable: true,
                        arguments: {
                            'x-dead-letter-exchange': 'dlx',
                        },
                    },
                },
            },
        ]),
    ],
    controllers: [BillingController],
    providers: [BillingService],
})
export class BillingModule {}
