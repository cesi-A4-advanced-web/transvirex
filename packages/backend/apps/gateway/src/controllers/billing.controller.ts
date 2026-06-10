import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../libs/guards/src/public.decorator';
import { GatewayService } from '../gateway.service';

@Controller()
export class BillingController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Billing')
    @Public()
    @Get('billing')
    @ApiOperation({ summary: 'List invoices' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Paginated list of invoices' })
    getBillings(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        return this.gatewayService.getBillings(page, limit);
    }

    @ApiTags('Billing')
    @Public()
    @Get('billing/:id')
    @ApiOperation({ summary: 'Get invoice by ID' })
    @ApiParam({ name: 'id', description: 'Invoice UUID' })
    @ApiResponse({ status: 200, description: 'Invoice detail' })
    @ApiResponse({ status: 404, description: 'Invoice not found' })
    getBilling(@Param('id') id: string) {
        return this.gatewayService.getBilling(id);
    }

    @ApiTags('Billing')
    @Public()
    @Post('billing')
    @ApiOperation({ summary: 'Create an invoice' })
    @ApiResponse({ status: 201, description: 'Invoice created' })
    createBilling(@Body() body: Record<string, unknown>) {
        return this.gatewayService.createBilling(body);
    }
}
