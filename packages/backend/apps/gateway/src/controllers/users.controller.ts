import { Roles } from '@app/guards/roles.decorator';
import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { GatewayService } from '../gateway.service';

@Controller()
export class UsersController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Users')
    @Post('users/:id/driver')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'driver')
    @ApiOperation({
        summary: 'Create driver profile',
        description: 'Create a Driver profile for the specified user. The user must have the driver role.',
    })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @ApiResponse({ status: 201, description: 'Driver profile created' })
    @ApiResponse({ status: 400, description: 'User does not have driver role or profile already exists' })
    @ApiResponse({ status: 404, description: 'User not found' })
    createDriver(@Param('id') id: string, @Body() body: { vehicle_id?: string; rating?: number }, @Req() req: Request) {
        return this.gatewayService.createDriver(id, body, (req as any).user);
    }

    @ApiTags('Users')
    @Get('users/:id/driver')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'driver')
    @ApiOperation({ summary: 'Get driver profile', description: 'Retrieve the Driver profile for the specified user.' })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'Driver profile' })
    @ApiResponse({ status: 404, description: 'User or Driver profile not found' })
    getDriver(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.getDriver(id, (req as any).user);
    }
}

