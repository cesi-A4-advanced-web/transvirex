import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'AUTH_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`],
                    queue: 'authentication_queue',
                    queueOptions: { durable: true },
                    noAck: true,
                }
            },
            {
                name: 'BILLING_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:5672`],
                    queue: 'billing_queue',
                    queueOptions: { durable: true },
                    noAck: true,
                }
            },
        ])],
    controllers: [GatewayController],
    providers: [GatewayService],
})
export class GatewayModule {}
