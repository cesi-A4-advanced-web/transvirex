import { Global, Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

/** Global module providing the RabbitMQService throughout the application. */
@Global()
@Module({
    providers: [RabbitMQService],
    exports: [RabbitMQService],
})
export class RabbitMQModule {}
