import { NestFactory } from '@nestjs/core';
import { StockModule } from './stock.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice(StockModule, {
        transport: 'rabbitmq',
        options: {
            urls: [
                `amqp://${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || 5672}`,
            ],
            queue: 'stock_queue',
            queueOptions: {
                durable: true,
            },
        },
    });

    await app.listen();
    console.log('Stock microservice is listening for messages...');
}
bootstrap().catch((error) => {
    console.error('Error starting stock microservice:', error);
    process.exit(1);
});
