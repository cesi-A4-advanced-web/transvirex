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
}
