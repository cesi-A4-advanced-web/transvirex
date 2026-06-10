import { Roles } from '@app/guards/roles.decorator';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateInvoiceDto, InvoiceStatusDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { UpdateInvoiceStatusDto } from '../dto/update-invoice-status.dto';
import { GatewayService } from '../gateway.service';

@Controller()
export class BillingController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Invoices')
    @Get('invoices')
    @ApiBearerAuth('JWT-auth')
    @Roles('business_manager')
    @ApiOperation({
        summary: 'List invoices',
        description: 'Returns a paginated list of invoices with optional filters.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'status', required: false, enum: InvoiceStatusDto })
    @ApiQuery({ name: 'customer_id', required: false, type: String })
    @ApiQuery({ name: 'hub_id', required: false, type: String })
    @ApiQuery({ name: 'due_date_from', required: false, type: String })
    @ApiQuery({ name: 'due_date_to', required: false, type: String })
    @ApiResponse({
        status: 200,
        description: 'Paginated list: { data, page, limit, total }',
    })
    getInvoices(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('status') status: InvoiceStatusDto | undefined,
        @Query('customer_id') customer_id: string | undefined,
        @Query('hub_id') hub_id: string | undefined,
        @Query('due_date_from') due_date_from: string | undefined,
        @Query('due_date_to') due_date_to: string | undefined,
        @Req() req: Request,
    ) {
        return this.gatewayService.getInvoices(
            page,
            limit,
            { status, customer_id, hub_id, due_date_from, due_date_to },
            (req as any).user,
        );
    }

    @ApiTags('Invoices')
    @Get('invoices/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('business_manager')
    @ApiOperation({
        summary: 'Get invoice by ID',
        description:
            'Returns invoice details with customer, hub, business manager, parcels, and deliveries.',
    })
    @ApiParam({ name: 'id', description: 'Invoice UUID' })
    @ApiResponse({ status: 200, description: 'Invoice detail' })
    @ApiResponse({ status: 404, description: 'Invoice not found' })
    getInvoice(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.getInvoice(id, (req as any).user);
    }

    @ApiTags('Invoices')
    @Post('invoices')
    @ApiBearerAuth('JWT-auth')
    @Roles('business_manager')
    @ApiOperation({
        summary: 'Create an invoice (quotation)',
        description:
            'Creates a new quotation linked to customer, hub, addresses, and business manager. Amount is calculated from parcels.',
    })
    @ApiResponse({ status: 201, description: 'Invoice created' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    createInvoice(@Body() body: CreateInvoiceDto, @Req() req: Request) {
        return this.gatewayService.createInvoice(body, (req as any).user);
    }

    @ApiTags('Invoices')
    @Patch('invoices/:id/status')
    @ApiBearerAuth('JWT-auth')
    @Roles('business_manager')
    @ApiOperation({
        summary: 'Transition invoice status',
        description: 'Validates and applies status transition: quotation → purchase_order → invoice.',
    })
    @ApiParam({ name: 'id', description: 'Invoice UUID' })
    @ApiResponse({ status: 200, description: 'Invoice status updated' })
    @ApiResponse({ status: 400, description: 'Invalid status transition' })
    @ApiResponse({ status: 404, description: 'Invoice not found' })
    updateInvoiceStatus(
        @Param('id') id: string,
        @Body() body: UpdateInvoiceStatusDto,
        @Req() req: Request,
    ) {
        return this.gatewayService.updateInvoiceStatus(id, body, (req as any).user);
    }

    @ApiTags('Invoices')
    @Patch('invoices/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('business_manager')
    @ApiOperation({
        summary: 'Update an invoice',
        description: 'Partially updates an invoice. Status changes use PATCH /invoices/:id/status.',
    })
    @ApiParam({ name: 'id', description: 'Invoice UUID' })
    @ApiResponse({ status: 200, description: 'Invoice updated' })
    @ApiResponse({ status: 404, description: 'Invoice not found' })
    updateInvoice(
        @Param('id') id: string,
        @Body() body: UpdateInvoiceDto,
        @Req() req: Request,
    ) {
        return this.gatewayService.updateInvoice(id, body, (req as any).user);
    }
}
