import { Roles } from '@app/guards/roles.decorator';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { GatewayService } from '../gateway.service';

@Controller()
export class CustomersController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Customers')
    @Get('customers')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'business_manager')
    @ApiOperation({
        summary: 'List customers',
        description: 'Returns customers, optionally filtered by hub.',
    })
    @ApiQuery({ name: 'hub_id', required: false, type: String })
    @ApiResponse({ status: 200, description: 'List of customers' })
    listCustomers(@Query('hub_id') hub_id?: string, @Req() req?: Request) {
        return this.gatewayService.listCustomers(hub_id, (req as any).user);
    }
}
