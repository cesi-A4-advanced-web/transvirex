import { Roles } from '@app/guards/roles.decorator';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Headers,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UnauthorizedException,
} from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import type { CreateDeliveryDto } from './dto/create-delivery.dto';
import type { UpdateDeliveryDto } from './dto/update-delivery.dto';

/** HTTP and RabbitMQ controller for delivery operations — position tracking, status progression, and event consumption. */
@Controller()
export class DeliveryController {
    constructor(private readonly deliveryService: DeliveryService) {}

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
    async updateStatus(
        @Param('id') id: string,
        @Body() body: { status: string; note?: string },
        @Headers('x-user-id') userId?: string,
        @Headers('x-user-role') userRole?: string,
    ) {
        return this.deliveryService.updateDeliveryStatus(id, body.status, body.note, { id: userId, role: userRole });
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
    listHubs() {
        return this.deliveryService.listHubs();
    }

    /** Create a new hub with the given reference, name, phone, manager, address, capacity, and status. */
    @ApiTags('Hubs')
    @Post('hubs')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Create a new hub' })
    @ApiResponse({ status: 201, description: 'Hub created' })
    createHub(@Body() body: any) {
        return this.deliveryService.createHub(body);
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
    getHub(@Param('id') id: string) {
        return this.deliveryService.getHub(id);
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
    updateHub(@Param('id') id: string, @Body() body: any) {
        return this.deliveryService.updateHub(id, body);
    }

    /** List the active deliveries of a driver, identified by their User id (JWT sub). */
    @Get('drivers/:userId/deliveries')
    listDriverDeliveries(@Param('userId') userId: string) {
        return this.deliveryService.listDriverDeliveries(userId);
    }

    /** Build the driver's dashboard (driver info + deliveries), identified by their User id (JWT sub). Scope: "today" (default) or "all". */
    @Get('drivers/:userId/dashboard')
    getDriverDashboard(@Param('userId') userId: string, @Query('scope') scope?: string) {
        return this.deliveryService.getDriverDashboard(userId, scope === 'all' ? 'all' : 'today');
    }

    /** Build the driver's profile (personal info, hub, vehicle, stats), identified by their User id (JWT sub). */
    @Get('drivers/:userId/profile')
    getDriverProfile(@Param('userId') userId: string) {
        return this.deliveryService.getDriverProfile(userId);
    }

    /** Create a DeliveryEvent (incident / status update) on a delivery. */
    @Post('deliveries/:id/events')
    createDeliveryEvent(
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
        return this.deliveryService.createDeliveryEvent(id, body);
    }

    @Get('deliveries')
    findAllDeliveries(
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
        return this.deliveryService.findAllDeliveries(
            page,
            limit,
            { status: status as never, hub_id, driver_id, date_from, date_to },
            { id: userId, role: userRole },
        );
    }

    @Post('deliveries')
    createDelivery(@Body() body: CreateDeliveryDto) {
        return this.deliveryService.createDelivery(body);
    }

    @Get('deliveries/:id')
    findDeliveryById(
        @Param('id') id: string,
        @Headers('x-user-id') userId?: string,
        @Headers('x-user-role') userRole?: string,
    ) {
        return this.deliveryService.findDeliveryById(id, {
            id: userId,
            role: userRole,
        });
    }

    @Patch('deliveries/:id')
    updateDelivery(@Param('id') id: string, @Body() body: UpdateDeliveryDto) {
        return this.deliveryService.updateDelivery(id, body);
    }

    @Delete('deliveries/:id')
    removeDelivery(@Param('id') id: string) {
        return this.deliveryService.removeDelivery(id);
    }

    @Get('hubs/:id/capacity')
    getHubCapacity(@Param('id') id: string) {
        return this.deliveryService.getHubCapacity(id);
    }
}
