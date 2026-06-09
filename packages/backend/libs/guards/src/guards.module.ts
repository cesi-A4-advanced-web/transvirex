import { Global, Module } from '@nestjs/common';
import { ProductionGuard } from './production.guard';

@Global()
@Module({
    providers: [ProductionGuard],
    exports: [ProductionGuard],
})
export class GuardsModule {}
