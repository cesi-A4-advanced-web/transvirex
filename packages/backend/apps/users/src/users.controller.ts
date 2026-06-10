import { Public } from '@app/guards/public.decorator';
import { Roles } from '@app/guards/roles.decorator';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

/** HTTP and RabbitMQ controller for users operations. */
@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    /** HTTP health-check endpoint. */
    @ApiTags('Users')
    @Public()
    @Get('health')
    @ApiOperation({ summary: 'Users service health check' })
    @ApiResponse({ status: 200, description: 'Users service is healthy' })
    getHealthHttp() {
        return { status: 'ok', service: 'users' };
    }

    /** RabbitMQ health-check handler. */
    @MessagePattern('health')
    @ApiOperation({ summary: 'Users service health check' })
    @ApiResponse({ status: 200, description: 'Users service is healthy' })
    getHealth() {
        return { status: 'ok', service: 'users' };
    }

    /** Create a Driver profile for the given user. */
    @ApiTags('Users')
    @Roles('dispatcher')
    @Post('users/:id/driver')
    @ApiOperation({ summary: 'Create a driver profile' })
    @ApiResponse({ status: 201, description: 'Driver profile created' })
    createDriver(@Param('id') id: string, @Body() body: { vehicle_id?: string; rating?: number }) {
        return this.usersService.createDriver(id, body);
    }

    /** Get the Driver profile for the given user. */
    @ApiTags('Users')
    @Get('users/:id/driver')
    @Roles('dispatcher', 'business_manager', 'admin', 'driver')
    @ApiOperation({ summary: 'Get a driver profile' })
    @ApiResponse({ status: 200, description: 'Driver profile retrieved' })
    getDriver(@Param('id') id: string) {
        return this.usersService.getDriver(id);
    }
}
