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
    Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateDeliveryDto, DeliveryStatusDto } from '../dto/create-delivery.dto';
import { UpdateDeliveryDto } from '../dto/update-delivery.dto';
import { UpdateDeliveryStatusDto } from '../dto/update-delivery-status.dto';
import { GatewayService } from '../gateway.service';

@Controller()
export class DeliveriesController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Deliveries')
    @Get('deliveries')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'business_manager', 'driver')
    @ApiOperation({
        summary: 'List deliveries',
        description: 'Returns a paginated list of deliveries. Drivers only see their own deliveries.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'status', required: false, enum: DeliveryStatusDto })
    @ApiQuery({ name: 'hub_id', required: false, type: String })
    @ApiQuery({ name: 'driver_id', required: false, type: String })
    @ApiQuery({ name: 'date_from', required: false, type: String })
    @ApiQuery({ name: 'date_to', required: false, type: String })
    @ApiResponse({
        status: 200,
        description: 'Paginated list: { data, page, limit, total }',
    })
    getDeliveries(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('status') status: DeliveryStatusDto | undefined,
        @Query('hub_id') hub_id: string | undefined,
        @Query('driver_id') driver_id: string | undefined,
        @Query('date_from') date_from: string | undefined,
        @Query('date_to') date_to: string | undefined,
        @Req() req: Request,
    ) {
        return this.gatewayService.getDeliveries(
            page,
            limit,
            { status, hub_id, driver_id, date_from, date_to },
            (req as any).user,
        );
    }

    @ApiTags('Deliveries')
    @Get('deliveries/mine')
    @ApiBearerAuth('JWT-auth')
    @Roles('driver')
    @ApiOperation({
        summary: "Get the authenticated driver's today dashboard",
        description: "Returns the driver's info (reference, rating) and today's deliveries. Scoped to the caller via the JWT.",
    })
    @ApiQuery({ name: 'scope', required: false, enum: ['today', 'all'], description: 'today (default) or all' })
    @ApiResponse({ status: 200, description: 'Driver dashboard: { driver, deliveries }' })
    getMyDashboard(@Query('scope') scope: string | undefined, @Req() req: Request) {
        return this.gatewayService.getMyDriverDashboard((req as any).user, scope);
    }

    @ApiTags('Deliveries')
    @Get('drivers/me/profile')
    @ApiBearerAuth('JWT-auth')
    @Roles('driver')
    @ApiOperation({
        summary: "Get the authenticated driver's profile",
        description: "Returns the driver's personal info, hub, assigned vehicle and lifetime stats. Scoped to the caller via the JWT.",
    })
    @ApiResponse({ status: 200, description: 'Driver profile: { user, hub, driver, vehicle, stats }' })
    getMyProfile(@Req() req: Request) {
        return this.gatewayService.getMyDriverProfile((req as any).user);
    }

    @ApiTags('Deliveries')
    @Get('deliveries/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'business_manager', 'driver')
    @ApiOperation({
        summary: 'Get delivery by ID',
        description: 'Returns delivery details with linked invoice, driver, and delivery events.',
    })
    @ApiParam({ name: 'id', description: 'Delivery UUID' })
    @ApiResponse({ status: 200, description: 'Delivery detail' })
    @ApiResponse({ status: 403, description: 'Driver access denied' })
    @ApiResponse({ status: 404, description: 'Delivery not found' })
    getDelivery(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.getDelivery(id, (req as any).user);
    }

    @ApiTags('Deliveries')
    @Post('deliveries')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'business_manager')
    @ApiOperation({
        summary: 'Create a delivery',
        description: 'Creates a delivery linked to an invoice and optionally a driver.',
    })
    @ApiResponse({ status: 201, description: 'Delivery created' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    createDelivery(@Body() body: CreateDeliveryDto, @Req() req: Request) {
        return this.gatewayService.createDelivery(body, (req as any).user);
    }

    @ApiTags('Deliveries')
    @Patch('deliveries/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'business_manager')
    @ApiOperation({
        summary: 'Update a delivery',
        description: 'Partially updates a delivery. Only provided fields are changed.',
    })
    @ApiParam({ name: 'id', description: 'Delivery UUID' })
    @ApiResponse({ status: 200, description: 'Delivery updated' })
    @ApiResponse({ status: 404, description: 'Delivery not found' })
    updateDelivery(@Param('id') id: string, @Body() body: UpdateDeliveryDto, @Req() req: Request) {
        return this.gatewayService.updateDelivery(id, body, (req as any).user);
    }

    @ApiTags('Deliveries')
    @Patch('deliveries/:id/status')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'driver')
    @ApiOperation({
        summary: 'Update a delivery status',
        description:
            'Advances a delivery to a new status with transition validation. Drivers can only update their own deliveries.',
    })
    @ApiParam({ name: 'id', description: 'Delivery UUID' })
    @ApiResponse({ status: 200, description: 'Delivery status updated' })
    @ApiResponse({ status: 400, description: 'Invalid status transition' })
    @ApiResponse({ status: 403, description: 'Driver access denied' })
    @ApiResponse({ status: 404, description: 'Delivery not found' })
    updateDeliveryStatus(@Param('id') id: string, @Body() body: UpdateDeliveryStatusDto, @Req() req: Request) {
        return this.gatewayService.updateDeliveryStatus(id, body, (req as any).user);
    }

    @ApiTags('Deliveries')
    @Delete('deliveries/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({
        summary: 'Delete a delivery',
        description: 'Deletes a delivery and its related delivery events.',
    })
    @ApiParam({ name: 'id', description: 'Delivery UUID' })
    @ApiResponse({ status: 200, description: 'Delivery deleted: { success, id }' })
    @ApiResponse({ status: 404, description: 'Delivery not found' })
    deleteDelivery(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.deleteDelivery(id, (req as any).user);
    }
}
