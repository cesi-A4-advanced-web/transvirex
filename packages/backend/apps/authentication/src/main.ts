import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { LoggingService, LoggingInterceptor } from '@app/logging';
import { AuthenticationModule } from './authentication.module';

/** Global app reference used for graceful shutdown. */
let app: INestApplication;

/** Bootstrap the authentication microservice with HTTP + RabbitMQ transport. */
async function bootstrap() {
    app = await NestFactory.create(AuthenticationModule, { bufferLogs: true });

    const logger = app.get(LoggingService);
    logger.setServiceName('authentication');
    app.useLogger(logger);
    app.useGlobalInterceptors(app.get(LoggingInterceptor));

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [
                `amqp://${process.env.RABBITMQ_USER || 'rabbitmq_user'}:${process.env.RABBITMQ_PASSWORD || 'rabbitmq_password'}@${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || 5672}`,
            ],
            queue: 'authentication_queue',
            queueOptions: {
                durable: true,
            },
        },
    });

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.startAllMicroservices();

    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    logger.log(`Authentication service listening on port ${PORT} (HTTP + RabbitMQ)`, 'Bootstrap');
}

/** Graceful shutdown on SIGTERM. */
process.on('SIGTERM', async () => {
    if (app) await app.close();
    process.exit(0);
});

bootstrap().catch((error) => {
    console.error('Error starting authentication service:', error);
    process.exit(1);
});
