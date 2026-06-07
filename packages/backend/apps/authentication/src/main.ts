import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AuthenticationModule } from './authentication.module';

async function bootstrap() {
    const app = await NestFactory.create(AuthenticationModule);

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

    await app.startAllMicroservices();

    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    console.log(
        `Authentication service listening on port ${PORT} (HTTP + RabbitMQ)`,
    );
}
bootstrap().catch((error) => {
    console.error('Error starting authentication service:', error);
    process.exit(1);
});
