import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/** Metadata key used to mark an endpoint as blocked in production. */
export const BLOCK_IN_PRODUCTION_KEY = 'blockInProduction';

/** Guard that blocks access to endpoints when running in production. */
@Injectable()
export class ProductionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    /** Deny access if the route is marked and NODE_ENV is production. */
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
