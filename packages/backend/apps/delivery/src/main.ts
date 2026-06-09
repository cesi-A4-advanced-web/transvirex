import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { LoggingService, LoggingInterceptor } from '@app/logging';
import { DeliveryModule } from './delivery.module';

/** Bootstrap the delivery microservice with HTTP + RabbitMQ transport. */
async function bootstrap() {
    const app = await NestFactory.create(DeliveryModule, { bufferLogs: true });

    const logger = app.get(LoggingService);
    logger.setServiceName('delivery');
    app.useLogger(logger);
    app.useGlobalInterceptors(app.get(LoggingInterceptor));

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [
                `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || 5672}`,
            ],
            queue: 'delivery_queue',
            queueOptions: {
                durable: true,
            },
        },
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.startAllMicroservices();
    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    logger.log(`Delivery service listening on port ${PORT} (HTTP + RabbitMQ)`, 'Bootstrap');
}
bootstrap().catch((error) => {
    console.error('Error starting delivery service:', error);
    process.exit(1);
});
