import { Roles } from '@app/guards/roles.decorator';
import { RedisService } from '@app/redis';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Cache } from 'cache-manager';
import { BillingService } from './billing.service';
import type { CreateInvoiceDto } from './dto/create-invoice.dto';
import type { InvoiceFiltersDto } from './dto/invoice-filters.dto';
import type { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import type { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Controller()
export class BillingController {
    constructor(
        private readonly billingService: BillingService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly redisService: RedisService,
    ) {}

    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'billing' };
    }

    @Get('invoices')
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('status') status?: InvoiceFiltersDto['status'],
        @Query('customer_id') customer_id?: string,
        @Query('hub_id') hub_id?: string,
        @Query('due_date_from') due_date_from?: string,
        @Query('due_date_to') due_date_to?: string,
    ) {
        const filters = { status, customer_id, hub_id, due_date_from, due_date_to };
        const cacheKey = `invoices:list:${page}:${limit}:${JSON.stringify(filters)}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.billingService.findAll(page, limit, filters);
        await this.cacheManager.set(cacheKey, data, 600_000);
        return data;
    }

    @Post('invoices')
    async create(@Body() body: CreateInvoiceDto) {
        const result = await this.billingService.create(body);
        await this.redisService.keys('invoices:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Patch('invoices/:id/status')
    async transitionStatus(@Param('id') id: string, @Body() body: UpdateInvoiceStatusDto) {
        const result = await this.billingService.transitionStatus(id, body);
        await this.cacheManager.del(`invoices:${id}`);
        await this.redisService.keys('invoices:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Get('invoices/:id')
    async findById(@Param('id') id: string) {
        const cacheKey = `invoices:${id}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.billingService.findById(id);
        await this.cacheManager.set(cacheKey, data, 600_000);
        return data;
    }

    @Get('customers')
    async listCustomers(@Query('hub_id') hub_id?: string) {
        const cacheKey = `customers:list:${hub_id || 'all'}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.billingService.listCustomers(hub_id);
        await this.cacheManager.set(cacheKey, data, 3600_000);
        return data;
    }

    @Get('customers/:id')
    async getCustomer(@Param('id') id: string) {
        const cacheKey = `customers:${id}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.billingService.getCustomer(id);
        await this.cacheManager.set(cacheKey, data, 3600_000);
        return data;
    }

    @Post('customers')
    async createCustomer(@Body() body: Record<string, any>) {
        const result = await this.billingService.createCustomer(body);
        await this.redisService.keys('customers:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Patch('customers/:id')
    async updateCustomer(@Param('id') id: string, @Body() body: Record<string, any>) {
        const result = await this.billingService.updateCustomer(id, body);
        await this.cacheManager.del(`customers:${id}`);
        await this.redisService.keys('customers:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Delete('customers/:id')
    async deleteCustomer(@Param('id') id: string) {
        const result = await this.billingService.deleteCustomer(id);
        await this.cacheManager.del(`customers:${id}`);
        await this.redisService.keys('customers:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Patch('invoices/:id')
    async update(@Param('id') id: string, @Body() body: UpdateInvoiceDto) {
        const result = await this.billingService.update(id, body);
        await this.cacheManager.del(`invoices:${id}`);
        await this.redisService.keys('invoices:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Delete('invoices/:id')
    async remove(@Param('id') id: string) {
        const result = await this.billingService.remove(id);
        await this.cacheManager.del(`invoices:${id}`);
        await this.redisService.keys('invoices:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'billing' };
    }

    @Post('invoices/:id/parcels')
    async addParcel(@Param('id') id: string, @Body() body: { weight: number; reference?: string }) {
        const result = await this.billingService.addParcel(id, body);
        await this.cacheManager.del(`invoices:${id}:parcels`);
        return result;
    }

    @Get('invoices/:id/parcels')
    async listParcels(@Param('id') id: string) {
        const cacheKey = `invoices:${id}:parcels`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.billingService.listParcels(id);
        await this.cacheManager.set(cacheKey, data, 600_000);
        return data;
    }

    @Get('parcels')
    async listAllParcels(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    ) {
        const cacheKey = `parcels:list:${page}:${limit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.billingService.listAllParcels(page, limit);
        await this.cacheManager.set(cacheKey, data, 600_000);
        return data;
    }

    @Get('parcels/:id')
    async getParcel(@Param('id') id: string) {
        const cacheKey = `parcels:${id}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.billingService.getParcel(id);
        await this.cacheManager.set(cacheKey, data, 600_000);
        return data;
    }

    @Patch('parcels/:id')
    async updateParcel(@Param('id') id: string, @Body() body: { weight?: number; reference?: string }) {
        const result = await this.billingService.updateParcel(id, body);
        await this.cacheManager.del(`parcels:${id}`);
        return result;
    }

    @Delete('invoices/:id/parcels/:parcelId')
    async deleteParcel(@Param('id') id: string, @Param('parcelId') parcelId: string) {
        const result = await this.billingService.deleteParcel(id, parcelId);
        await this.cacheManager.del(`invoices:${id}:parcels`);
        await this.cacheManager.del(`parcels:${parcelId}`);
        return result;
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
        const result = await this.billingService.confirmInvoice(id);
        await this.cacheManager.del(`invoices:${id}`);
        await this.redisService.keys('invoices:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
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
