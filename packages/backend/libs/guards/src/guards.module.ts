import { Global, Module } from '@nestjs/common';
import { ProductionGuard } from './production.guard';

/** Global module providing guards used across microservices. */
@Global()
@Module({
    providers: [ProductionGuard],
    exports: [ProductionGuard],
})
export class GuardsModule {}
