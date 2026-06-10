import { Roles } from '@app/guards/roles.decorator';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { GatewayService } from '../gateway.service';

@Controller()
export class VehiclesController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Vehicles')
    @Get('vehicles')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'List vehicles', description: 'Retrieve all vehicles, optionally filtered by hub.' })
    @ApiQuery({ name: 'hub_id', required: false, description: 'Filter by hub UUID' })
    @ApiResponse({ status: 200, description: 'List of vehicles' })
    listVehicles(@Query('hub_id') hub_id?: string, @Req() req?: Request) {
        return this.gatewayService.listVehicles(hub_id, (req as any).user);
    }

    @ApiTags('Vehicles')
    @Post('vehicles')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Create a vehicle', description: 'Add a new vehicle to the fleet.' })
    @ApiResponse({ status: 201, description: 'Vehicle created' })
    createVehicle(@Body() body: CreateVehicleDto, @Req() req: Request) {
        return this.gatewayService.createVehicle(body, (req as any).user);
    }

    @ApiTags('Vehicles')
    @Patch('vehicles/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({
        summary: 'Update a vehicle',
        description: 'Update vehicle fields (hub, type, plate) and/or assign a driver.',
    })
    @ApiParam({ name: 'id', description: 'Vehicle UUID' })
    @ApiResponse({ status: 200, description: 'Vehicle updated' })
    updateVehicle(@Param('id') id: string, @Body() body: UpdateVehicleDto, @Req() req: Request) {
        return this.gatewayService.updateVehicle(id, body, (req as any).user);
    }

    @ApiTags('Vehicles')
    @Delete('vehicles/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Delete a vehicle', description: 'Remove a vehicle from the fleet.' })
    @ApiParam({ name: 'id', description: 'Vehicle UUID' })
    @ApiResponse({ status: 200, description: 'Vehicle deleted' })
    deleteVehicle(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.deleteVehicle(id, (req as any).user);
    }
}
