import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Post,
} from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
    constructor(private readonly gatewayService: GatewayService) {}

    @Get()
    getHello(): string {
        return this.gatewayService.getHello();
    }

    @Get('gateway/health')
    getGatewayHealth() {
        return this.gatewayService.getGatewayHealth();
    }

    @Get('auth/health')
    getAuthHealth() {
        return this.gatewayService.getAuthHealth();
    }

    @Get('billing/health')
    getBillingHealth() {
        return this.gatewayService.getBillingHealth();
    }

    @Get('stock/health')
    getStockHealth() {
        return this.gatewayService.getStockHealth();
    }

    @Get('delivery/health')
    getDeliveryHealth() {
        return this.gatewayService.getDeliveryHealth();
    }

    @Get('users/health')
    getUsersHealth() {
        return this.gatewayService.getUsersHealth();
    }

    @Post('debug/postgresql')
    async executePostgreSQL(@Body('query') query: string) {
        if (process.env.NODE_ENV !== 'development') {
            throw new ForbiddenException(
                'Debug endpoints are only available in development mode',
            );
        }
        if (!query || typeof query !== 'string') {
            throw new ForbiddenException(
                'query is required and must be a string',
            );
        }
        return this.gatewayService.executePostgreSQL(query);
    }
}
