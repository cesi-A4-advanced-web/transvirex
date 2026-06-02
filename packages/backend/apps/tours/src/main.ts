import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { ToursModule } from './tours.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice(ToursModule, {
        transport: Transport.RMQ,
        options: {
            urls: [
                `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || 5672}`,
            ],
            queue: 'tours_queue',
            queueOptions: {
                durable: true,
            },
        },
    });

    await app.listen();
    console.log('Tours microservice is listening for messages...');
}
bootstrap().catch((error) => {
    console.error('Error starting tours microservice:', error);
    process.exit(1);
});
