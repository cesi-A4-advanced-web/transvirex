import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { StockService } from './stock.service';

@Controller()
export class StockController {
    constructor(private readonly stockService: StockService) {}

    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'stock' };
    }

    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'stock' };
    }

    @Get('vehicles')
    listVehicles(@Query('hub_id') hub_id?: string) {
        return this.stockService.listVehicles(hub_id);
    }

    @Post('vehicles')
    createVehicle(@Body() body: { hub_id?: string; type?: string; license_plate?: string }) {
        return this.stockService.createVehicle(body);
    }

    @Patch('vehicles/:id')
    updateVehicle(
        @Param('id') id: string,
        @Body() body: { hub_id?: string; type?: string; license_plate?: string; driver_id?: string | null },
    ) {
        return this.stockService.updateVehicle(id, body);
    }

    @Delete('vehicles/:id')
    deleteVehicle(@Param('id') id: string) {
        return this.stockService.deleteVehicle(id);
    }
}
