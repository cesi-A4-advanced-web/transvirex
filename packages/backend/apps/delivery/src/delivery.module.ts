import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@app/database';
import { LoggingModule } from '@app/logging';
import { RedisModule } from '@app/redis';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

/**
 * Root module for the delivery microservice.
 * Provides HTTP endpoints for delivery management, GPS position tracking (Redis),
 * delivery status progression with state-machine validation, and RabbitMQ event
 * consumption (delivery.created, delivery.assigned).
 */
@Module({
    imports: [
        DatabaseModule,
        LoggingModule,
        RedisModule,
        ClientsModule.register([
            {
                name: 'RMQ_CLIENT',
                transport: Transport.RMQ,
                options: {
                    urls: [
                        `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || 5672}`,
                    ],
                    queue: 'delivery_queue',
                    queueOptions: { durable: true },
                },
            },
        ]),
    ],
    controllers: [DeliveryController],
    providers: [DeliveryService],
})
export class DeliveryModule {}
