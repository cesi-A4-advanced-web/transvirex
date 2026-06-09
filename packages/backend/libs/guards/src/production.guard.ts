import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const BLOCK_IN_PRODUCTION_KEY = 'blockInProduction';

@Injectable()
export class ProductionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const blockInProduction = this.reflector.getAllAndOverride<boolean>(
            BLOCK_IN_PRODUCTION_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (blockInProduction && process.env.NODE_ENV === 'production') {
            throw new ForbiddenException(
                'This endpoint is not available in production',
            );
        }

        return true;
    }
}
