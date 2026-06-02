import { Controller, Get } from '@nestjs/common';
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
        return this.gatewayService.getGatewayHealth()
    }

    @Get('auth/health')
    getAuthHealth() {
        return this.gatewayService.getAuthHealth()
    }

    @Get('billing/health')
    getBillingHealth() {
        return this.gatewayService.getBillingHealth()
    }

    @Get('stock/health')
    getStockHealth() {
        return this.gatewayService.getStockHealth()
    }

    @Get('tours/health')
    getToursHealth() {
        return this.gatewayService.getToursHealth()
    }

    @Get('users/health')
    getUsersHealth() {
        return this.gatewayService.getUsersHealth()
    }
}
