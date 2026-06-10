import { Public } from '@app/guards/public.decorator';
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
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

/** HTTP and RabbitMQ controller for users operations. */
@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Public()
    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'users' };
    }

    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'users' };
    }

    @Get('users')
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('hub_id') hub_id?: string,
        @Query('role') role?: string,
        @Query('status') status?: string,
    ) {
        return this.usersService.findAll(page, limit, {
            hub_id,
            role: role as never,
            status: status as never,
        });
    }

    @Post('users')
    create(@Body() body: CreateUserDto) {
        return this.usersService.create(body);
    }

    @Post('users/:id/driver')
    @Roles('dispatcher')
    createDriver(@Param('id') id: string, @Body() body: { vehicle_id?: string; rating?: number }) {
        return this.usersService.createDriver(id, body);
    }

    @Get('users/:id/driver')
    @Roles('dispatcher', 'business_manager', 'admin', 'driver')
    getDriver(@Param('id') id: string) {
        return this.usersService.getDriver(id);
    }

    @Get('users/:id')
    findById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Patch('users/:id')
    update(@Param('id') id: string, @Body() body: UpdateUserDto) {
        return this.usersService.update(id, body);
    }

    @Delete('users/:id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
