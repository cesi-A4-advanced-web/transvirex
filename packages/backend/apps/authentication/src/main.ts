import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { AuthenticationModule } from './authentication.module';

let app: INestApplication;

async function bootstrap() {
    app = await NestFactory.create(AuthenticationModule);

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
    console.log(
        `Authentication service listening on port ${PORT} (HTTP + RabbitMQ)`,
    );
}

process.on('SIGTERM', async () => {
    if (app) await app.close();
    process.exit(0);
});

bootstrap().catch((error) => {
    console.error('Error starting authentication service:', error);
    process.exit(1);
});
