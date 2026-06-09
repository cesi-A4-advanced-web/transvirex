import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { LoggingModule } from '@app/logging';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

/** Root module for the delivery microservice. */
@Module({
    imports: [DatabaseModule, LoggingModule],
    controllers: [DeliveryController],
    providers: [DeliveryService],
})
export class DeliveryModule {}
