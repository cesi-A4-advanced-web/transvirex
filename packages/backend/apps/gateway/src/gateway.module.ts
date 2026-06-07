import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
    imports: [DatabaseModule],
    controllers: [GatewayController],
    providers: [GatewayService],
})
export class GatewayModule {}
