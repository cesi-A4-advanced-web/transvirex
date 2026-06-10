import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Gateway')
    @Public()
    @Get()
    @ApiOperation({
        summary: 'Hello',
        description: 'Root endpoint - returns a greeting message',
    })
    @ApiResponse({ status: 200, description: 'Greeting message', schema: { type: 'string' } })
    getHello(): string {
        return this.gatewayService.getHello();
    }

    @ApiTags('Gateway')
    @Public()
    @Get('gateway/health')
    @ApiOperation({ summary: 'Gateway health check' })
    @ApiResponse({ status: 200, description: 'Gateway service is healthy' })
    getGatewayHealth() {
        return this.gatewayService.getGatewayHealth();
    }
}

