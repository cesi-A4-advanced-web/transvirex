import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { UsersModule } from './users.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice(UsersModule, {
        transport: Transport.RMQ,
        options: {
            urls: [
                `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || 5672}`,
            ],
            queue: 'users_queue',
            queueOptions: {
                durable: true,
            },
        },
    });

    await app.listen();
    console.log('Users microservice is listening for messages...');
}
bootstrap().catch((error) => {
    console.error('Error starting users microservice:', error);
    process.exit(1);
});
