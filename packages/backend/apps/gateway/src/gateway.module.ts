import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { RabbitMQModule } from '@app/rabbitmq';
import { MongoDBModule } from '@app/mongodb';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
    imports: [DatabaseModule, RedisModule, RabbitMQModule, MongoDBModule],
    controllers: [GatewayController],
    providers: [GatewayService],
})
export class GatewayModule {}
