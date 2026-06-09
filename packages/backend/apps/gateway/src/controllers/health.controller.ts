import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { GatewayService } from '../gateway.service';

@Controller()
export class HealthController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Health')
    @Public()
    @Get('auth/health')
    @ApiOperation({ summary: 'Authentication service health check' })
    @ApiResponse({ status: 200, description: 'Authentication service is healthy' })
    getAuthHealth() {
        return this.gatewayService.getAuthHealth();
    }

    @ApiTags('Health')
    @Public()
    @Get('billing/health')
    @ApiOperation({ summary: 'Billing service health check' })
    @ApiResponse({ status: 200, description: 'Billing service is healthy' })
    getBillingHealth() {
        return this.gatewayService.getBillingHealth();
    }

    @ApiTags('Health')
    @Public()
    @Get('stock/health')
    @ApiOperation({ summary: 'Stock service health check' })
    @ApiResponse({ status: 200, description: 'Stock service is healthy' })
    getStockHealth() {
        return this.gatewayService.getStockHealth();
    }

    @ApiTags('Health')
    @Public()
    @Get('delivery/health')
    @ApiOperation({ summary: 'Delivery service health check' })
    @ApiResponse({ status: 200, description: 'Delivery service is healthy' })
    getDeliveryHealth() {
        return this.gatewayService.getDeliveryHealth();
    }

    @ApiTags('Health')
    @Public()
    @Get('users/health')
    @ApiOperation({ summary: 'Users service health check' })
    @ApiResponse({ status: 200, description: 'Users service is healthy' })
    getUsersHealth() {
        return this.gatewayService.getUsersHealth();
    }
}
