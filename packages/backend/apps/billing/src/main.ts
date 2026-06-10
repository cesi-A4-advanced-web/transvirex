import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { connect } from 'amqplib';
import { LoggingService, LoggingInterceptor } from '@app/logging';
import { BillingModule } from './billing.module';

/** Bootstrap the billing microservice with HTTP + RabbitMQ transport. */
async function bootstrap() {
    const app = await NestFactory.create(BillingModule, { bufferLogs: true });

    const logger = app.get(LoggingService);
    logger.setServiceName('billing');
    app.useLogger(logger);
    app.useGlobalInterceptors(app.get(LoggingInterceptor));

    app.connectMicroservice({
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
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.startAllMicroservices();

    const amqpUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || 5672}`;
    const conn = await connect(amqpUrl);
    const channel = await conn.createChannel();
    await channel.assertExchange('dlx', 'direct', { durable: true });
    await channel.assertQueue('billing_queue_dlq', { durable: true });
    await channel.bindQueue('billing_queue_dlq', 'dlx', 'billing_queue');
    await channel.close();
    await conn.close();

    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    logger.log(`Billing service listening on port ${PORT} (HTTP + RabbitMQ)`, 'Bootstrap');
}
bootstrap().catch((error) => {
    console.error('Error starting billing service:', error);
    process.exit(1);
});
