import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DeliveryService } from './delivery.service';

@Controller()
export class DeliveryController {
    constructor(private readonly deliveryService: DeliveryService) {}

    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'delivery' };
    }

    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'delivery' };
    }

    @Get('hubs')
    listHubs() {
        return this.deliveryService.listHubs();
    }

    @Post('hubs')
    createHub(@Body() body: any) {
        return this.deliveryService.createHub(body);
    }

    @Get('hubs/:id')
    getHub(@Param('id') id: string) {
        return this.deliveryService.getHub(id);
    }

    @Patch('hubs/:id')
    updateHub(@Param('id') id: string, @Body() body: any) {
        return this.deliveryService.updateHub(id, body);
    }

    /** List the active deliveries of a driver, identified by their User id (JWT sub). */
    @Get('drivers/:userId/deliveries')
    listDriverDeliveries(@Param('userId') userId: string) {
        return this.deliveryService.listDriverDeliveries(userId);
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
}
