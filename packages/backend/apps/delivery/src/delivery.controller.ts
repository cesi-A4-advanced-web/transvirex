import { Roles } from '@app/guards/roles.decorator';
import { RedisService } from '@app/redis';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Headers,
    Inject,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UnauthorizedException,
} from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Cache } from 'cache-manager';
import { DeliveryService } from './delivery.service';
import type { CreateDeliveryDto } from './dto/create-delivery.dto';
import type { UpdateDeliveryDto } from './dto/update-delivery.dto';

/** HTTP and RabbitMQ controller for delivery operations — position tracking, status progression, and event consumption. */
@Controller()
export class DeliveryController {
    constructor(
        private readonly deliveryService: DeliveryService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly redisService: RedisService,
    ) {}

    /** HTTP health-check endpoint. */
    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'delivery' };
    }

    /** RabbitMQ health-check handler. */
    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'delivery' };
    }

    /** Store the authenticated driver's live GPS position in Redis (5-min TTL). Reads driver ID from x-user-id header. */
    @ApiTags('Deliveries')
    @Patch('deliveries/position')
    @ApiBearerAuth('JWT-auth')
    @Roles('driver')
    @ApiOperation({ summary: 'Update driver live GPS position' })
    @ApiResponse({ status: 200, description: 'Position updated' })
    async updatePosition(@Body() body: { lat: number; lng: number }, @Headers('x-user-id') userId: string) {
        if (!userId) throw new UnauthorizedException('Utilisateur non identifié');
        return this.deliveryService.updatePosition(userId, body.lat, body.lng);
    }

    /** Return the cached GPS position of a driver from Redis. Returns { status: "expired" } if the 5-min TTL elapsed. */
    @ApiTags('Deliveries')
    @Get('drivers/:id/position')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Get driver current GPS position' })
    @ApiParam({ name: 'id', description: 'Driver UUID' })
    @ApiResponse({ status: 200, description: 'Driver position or expired status' })
    async getDriverPosition(@Param('id') driverId: string) {
        const pos = await this.deliveryService.getDriverPosition(driverId);
        if (!pos) return { status: 'expired' };
        return pos;
    }

    /** Advance a delivery to a new status. Validates transitions, creates a DeliveryEvent, and emits delivery.status_changed via RabbitMQ when delivered. */
    @ApiTags('Deliveries')
    @Patch('deliveries/:id/status')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'driver')
    @ApiOperation({ summary: 'Update delivery status with transition validation' })
    @ApiParam({ name: 'id', description: 'Delivery UUID' })
    @ApiResponse({ status: 200, description: 'Delivery status updated' })
    @ApiResponse({ status: 400, description: 'Invalid status transition' })
    @ApiResponse({ status: 404, description: 'Delivery not found' })
    async updateStatus(@Param('id') id: string, @Body() body: { status: string; note?: string }) {
        const result = await this.deliveryService.updateDeliveryStatus(id, body.status, body.note);
        await this.cacheManager.del(`deliveries:${id}`);
        await this.redisService.keys('deliveries:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    /** Consume delivery.created (emitted by billing when an invoice is confirmed) and create a Delivery record with planned status. */
    @EventPattern('delivery.created')
    async handleDeliveryCreated(data: { invoiceId: string; reference: string }) {
        await this.deliveryService.createFromInvoice(data.invoiceId, data.reference);
    }

    /** Consume delivery.assigned to acknowledge a driver assignment. Placeholder for future push notification logic. */
    @EventPattern('delivery.assigned')
    async handleDeliveryAssigned(data: { deliveryId: string; driverId: string }) {
        return { received: true, deliveryId: data.deliveryId, driverId: data.driverId };
    }

    /** Return all hubs with address and aggregate counts (users, vehicles, customers, invoices). */
    @ApiTags('Hubs')
    @Get('hubs')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'List all hubs' })
    @ApiResponse({ status: 200, description: 'List of hubs' })
    async listHubs() {
        const cacheKey = 'hubs:list';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.deliveryService.listHubs();
        await this.cacheManager.set(cacheKey, data, 3600_000);
        return data;
    }

    /** Create a new hub with the given reference, name, phone, manager, address, capacity, and status. */
    @ApiTags('Hubs')
    @Post('hubs')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Create a new hub' })
    @ApiResponse({ status: 201, description: 'Hub created' })
    async createHub(@Body() body: any) {
        const result = await this.deliveryService.createHub(body);
        await this.cacheManager.del('hubs:list');
        return result;
    }

    /** Return a single hub by UUID with address and aggregate stats. Throws 404 if not found. */
    @ApiTags('Hubs')
    @Get('hubs/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Get hub detail with stats' })
    @ApiParam({ name: 'id', description: 'Hub UUID' })
    @ApiResponse({ status: 200, description: 'Hub detail with stats' })
    @ApiResponse({ status: 404, description: 'Hub not found' })
    async getHub(@Param('id') id: string) {
        const cacheKey = `hubs:${id}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.deliveryService.getHub(id);
        await this.cacheManager.set(cacheKey, data, 3600_000);
        return data;
    }

    /** Update a hub's fields (name, phone, manager, address, capacity, status). Throws 404 if not found. */
    @ApiTags('Hubs')
    @Patch('hubs/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Update hub' })
    @ApiParam({ name: 'id', description: 'Hub UUID' })
    @ApiResponse({ status: 200, description: 'Hub updated' })
    @ApiResponse({ status: 404, description: 'Hub not found' })
    async updateHub(@Param('id') id: string, @Body() body: any) {
        const result = await this.deliveryService.updateHub(id, body);
        await this.cacheManager.del('hubs:list');
        await this.cacheManager.del(`hubs:${id}`);
        await this.cacheManager.del(`hubs:${id}:capacity`);
        return result;
    }

    /** List the active deliveries of a driver, identified by their User id (JWT sub). */
    @Get('drivers/:userId/deliveries')
    async listDriverDeliveries(@Param('userId') userId: string) {
        const cacheKey = `drivers:${userId}:deliveries`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.deliveryService.listDriverDeliveries(userId);
        await this.cacheManager.set(cacheKey, data, 300_000);
        return data;
    }

    /** Create a DeliveryEvent (incident / status update) on a delivery. */
    @Post('deliveries/:id/events')
    async createDeliveryEvent(
        @Param('id') id: string,
        @Body()
        body: {
            description?: string;
            type?: string;
            status?: string;
            latitude?: number;
            longitude?: number;
        },
    ) {
        const result = await this.deliveryService.createDeliveryEvent(id, body);
        await this.cacheManager.del(`deliveries:${id}`);
        return result;
    }

    @Get('deliveries')
    async findAllDeliveries(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('status') status?: string,
        @Query('hub_id') hub_id?: string,
        @Query('driver_id') driver_id?: string,
        @Query('date_from') date_from?: string,
        @Query('date_to') date_to?: string,
        @Headers('x-user-id') userId?: string,
        @Headers('x-user-role') userRole?: string,
    ) {
        const filters = { status: status as never, hub_id, driver_id, date_from, date_to };
        const cacheKey = `deliveries:list:${page}:${limit}:${JSON.stringify(filters)}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.deliveryService.findAllDeliveries(page, limit, filters, { id: userId, role: userRole });
        await this.cacheManager.set(cacheKey, data, 120_000);
        return data;
    }

    @Post('deliveries')
    async createDelivery(@Body() body: CreateDeliveryDto) {
        const result = await this.deliveryService.createDelivery(body);
        await this.redisService.keys('deliveries:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Get('deliveries/:id')
    async findDeliveryById(
        @Param('id') id: string,
        @Headers('x-user-id') userId?: string,
        @Headers('x-user-role') userRole?: string,
    ) {
        const cacheKey = `deliveries:${id}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.deliveryService.findDeliveryById(id, {
            id: userId,
            role: userRole,
        });
        await this.cacheManager.set(cacheKey, data, 300_000);
        return data;
    }

    @Patch('deliveries/:id')
    async updateDelivery(@Param('id') id: string, @Body() body: UpdateDeliveryDto) {
        const result = await this.deliveryService.updateDelivery(id, body);
        await this.cacheManager.del(`deliveries:${id}`);
        await this.redisService.keys('deliveries:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Delete('deliveries/:id')
    async removeDelivery(@Param('id') id: string) {
        const result = await this.deliveryService.removeDelivery(id);
        await this.cacheManager.del(`deliveries:${id}`);
        await this.redisService.keys('deliveries:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Get('hubs/:id/capacity')
    async getHubCapacity(@Param('id') id: string) {
        const cacheKey = `hubs:${id}:capacity`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.deliveryService.getHubCapacity(id);
        await this.cacheManager.set(cacheKey, data, 300_000);
        return data;
    }
}
