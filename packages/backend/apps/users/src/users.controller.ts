import { Public } from '@app/guards/public.decorator';
import { Roles } from '@app/guards/roles.decorator';
import { RedisService } from '@app/redis';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import type { Cache } from 'cache-manager';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

/** HTTP and RabbitMQ controller for users operations. */
@Controller()
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly redisService: RedisService,
    ) {}

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
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('hub_id') hub_id?: string,
        @Query('role') role?: string,
        @Query('status') status?: string,
    ) {
        const filters = { hub_id, role, status };
        const cacheKey = `users:list:${page}:${limit}:${JSON.stringify(filters)}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.usersService.findAll(page, limit, {
            hub_id,
            role: role as never,
            status: status as never,
        });
        await this.cacheManager.set(cacheKey, data, 300_000);
        return data;
    }

    @Post('users')
    async create(@Body() body: CreateUserDto) {
        const result = await this.usersService.create(body);
        await this.redisService.keys('users:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Post('users/:id/driver')
    @Roles('dispatcher')
    async createDriver(@Param('id') id: string, @Body() body: { vehicle_id?: string; rating?: number }) {
        const result = await this.usersService.createDriver(id, body);
        await this.cacheManager.del(`users:${id}:driver`);
        await this.redisService.keys('users:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Get('users/:id/driver')
    @Roles('dispatcher', 'business_manager', 'admin', 'driver')
    async getDriver(@Param('id') id: string) {
        const cacheKey = `users:${id}:driver`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.usersService.getDriver(id);
        await this.cacheManager.set(cacheKey, data, 300_000);
        return data;
    }

    @Get('users/:id')
    async findById(@Param('id') id: string) {
        const cacheKey = `users:${id}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;
        const data = await this.usersService.findById(id);
        await this.cacheManager.set(cacheKey, data, 300_000);
        return data;
    }

    @Patch('users/:id')
    async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
        const result = await this.usersService.update(id, body);
        await this.cacheManager.del(`users:${id}`);
        await this.cacheManager.del(`users:${id}:driver`);
        await this.redisService.keys('users:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }

    @Delete('users/:id')
    async remove(@Param('id') id: string) {
        const result = await this.usersService.remove(id);
        await this.cacheManager.del(`users:${id}`);
        await this.cacheManager.del(`users:${id}:driver`);
        await this.redisService.keys('users:list:*').then((keys) => {
            if (keys.length > 0) this.redisService.del(...keys);
        });
        return result;
    }
}
