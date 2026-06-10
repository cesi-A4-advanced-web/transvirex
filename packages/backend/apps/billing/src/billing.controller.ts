import { Roles } from '@app/guards/roles.decorator';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';
import type { InvoiceFiltersDto } from './dto/invoice-filters.dto';
import type { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import type { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller()
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'billing' };
    }

    @Get('invoices')
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('status') status?: InvoiceFiltersDto['status'],
        @Query('customer_id') customer_id?: string,
        @Query('hub_id') hub_id?: string,
        @Query('due_date_from') due_date_from?: string,
        @Query('due_date_to') due_date_to?: string,
    ) {
        return this.billingService.findAll(page, limit, {
            status,
            customer_id,
            hub_id,
            due_date_from,
            due_date_to,
        });
    }

    @Post('invoices')
    create(@Body() body: CreateInvoiceDto) {
        return this.billingService.create(body);
    }

    @Patch('invoices/:id/status')
    transitionStatus(@Param('id') id: string, @Body() body: UpdateInvoiceStatusDto) {
        return this.billingService.transitionStatus(id, body);
    }

    @Get('invoices/:id')
    findById(@Param('id') id: string) {
        return this.billingService.findById(id);
    }

    @Patch('invoices/:id')
    update(@Param('id') id: string, @Body() body: UpdateInvoiceDto) {
        return this.billingService.update(id, body);
    }

    @Delete('invoices/:id')
    remove(@Param('id') id: string) {
        return this.billingService.remove(id);
    }

    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'billing' };
    }

    @Post('invoices/:id/parcels')
    addParcel(@Param('id') id: string, @Body() body: { weight: number; reference?: string }) {
        return this.billingService.addParcel(id, body);
    }

    @Get('invoices/:id/parcels')
    listParcels(@Param('id') id: string) {
        return this.billingService.listParcels(id);
    }

    @Delete('invoices/:id/parcels/:parcelId')
    deleteParcel(@Param('id') id: string, @Param('parcelId') parcelId: string) {
        return this.billingService.deleteParcel(id, parcelId);
    }

    @ApiTags('Billing')
    @Patch('invoices/:id/confirm')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'business_manager')
    @ApiOperation({ summary: 'Confirm an invoice and emit delivery.created' })
    @ApiParam({ name: 'id', description: 'Invoice UUID' })
    @ApiResponse({ status: 200, description: 'Invoice confirmed' })
    @ApiResponse({ status: 404, description: 'Invoice not found' })
    async confirmInvoice(@Param('id') id: string) {
        return this.billingService.confirmInvoice(id);
    }

    /** Consume delivery status change events to trigger invoicing. */
    @EventPattern('delivery.status_changed')
    async handleDeliveryStatusChanged(data: {
        deliveryId: string;
        previousStatus: string;
        newStatus: string;
        timestamp: string;
    }) {
        await this.billingService.handleDeliveryDelivered(data);
    }
}
