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
import { MessagePattern } from '@nestjs/microservices';
import { BillingService } from './billing.service';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';
import type { InvoiceFiltersDto } from './dto/invoice-filters.dto';
import type { UpdateInvoiceDto } from './dto/update-invoice.dto';
import type { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';

/** HTTP and RabbitMQ controller for billing operations. */
@Controller()
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    /** HTTP health-check endpoint. */
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
    transitionStatus(
        @Param('id') id: string,
        @Body() body: UpdateInvoiceStatusDto,
    ) {
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

    /** RabbitMQ health-check handler. */
    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'billing' };
    }
}
