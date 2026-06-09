import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { LoggingModule } from '@app/logging';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
    imports: [DatabaseModule, LoggingModule],
    controllers: [StockController],
    providers: [StockService],
})
export class StockModule {}
