import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { LoggingModule } from '@app/logging';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

/** Root module for the billing microservice. */
@Module({
    imports: [DatabaseModule, LoggingModule],
    controllers: [BillingController],
    providers: [BillingService],
})
export class BillingModule {}
