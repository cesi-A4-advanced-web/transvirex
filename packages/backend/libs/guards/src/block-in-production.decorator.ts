import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { BLOCK_IN_PRODUCTION_KEY, ProductionGuard } from './production.guard';

export function BlockInProduction(): MethodDecorator & ClassDecorator {
    return applyDecorators(
        SetMetadata(BLOCK_IN_PRODUCTION_KEY, true),
        UseGuards(ProductionGuard),
    );
}
