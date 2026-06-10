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
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DeliveryService } from './delivery.service';
import type { CreateDeliveryDto } from './dto/create-delivery.dto';
import type { UpdateDeliveryDto } from './dto/update-delivery.dto';

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
}
