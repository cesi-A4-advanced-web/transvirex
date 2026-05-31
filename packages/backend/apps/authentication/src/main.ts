import { NestFactory } from '@nestjs/core';
import { AuthenticationModule } from './authentication.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice(AuthenticationModule, {
        transport: 'rabbitmq',
        options: {
            urls: [
                `amqp://${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || 5672}`,
            ],
            queue: 'authentication_queue',
            queueOptions: {
                durable: true,
            },
        },
    });

    await app.listen();
    console.log('Authentication microservice is listening for messages...');
}
bootstrap().catch((error) => {
    console.error('Error starting authentication microservice:', error);
    process.exit(1);
});
