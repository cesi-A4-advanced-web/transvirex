import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { RedisModule } from '@app/redis';
import { RabbitMQModule } from '@app/rabbitmq';
import { MongoDBModule } from '@app/mongodb';
import { GuardsModule } from '@app/guards';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
    imports: [DatabaseModule, RedisModule, RabbitMQModule, MongoDBModule, GuardsModule],
    controllers: [GatewayController],
    providers: [GatewayService],
})
export class GatewayModule {}
