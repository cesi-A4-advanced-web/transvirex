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
import { CreateDriverDto } from '../dto/create-driver.dto';
import { CreateUserDto, UserRoleDto, UserStatusDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { GatewayService } from '../gateway.service';

@Controller()
export class UsersController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Users')
    @Get('users')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'business_manager')
    @ApiOperation({
        summary: 'List users',
        description: 'Returns a paginated list of users with optional filters.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiQuery({ name: 'hub_id', required: false, type: String })
    @ApiQuery({ name: 'role', required: false, enum: UserRoleDto })
    @ApiQuery({ name: 'status', required: false, enum: UserStatusDto })
    @ApiResponse({
        status: 200,
        description: 'Paginated list: { data, page, limit, total }',
    })
    getUsers(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('hub_id') hub_id: string | undefined,
        @Query('role') role: UserRoleDto | undefined,
        @Query('status') status: UserStatusDto | undefined,
        @Req() req: Request,
    ) {
        return this.gatewayService.getUsers(page, limit, { hub_id, role, status }, (req as any).user);
    }

    @ApiTags('Users')
    @Post('users')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'business_manager')
    @ApiOperation({
        summary: 'Create a user',
        description: 'Creates a user. Reference is auto-generated if omitted. Password is hashed before storage.',
    })
    @ApiResponse({ status: 201, description: 'User created' })
    @ApiResponse({ status: 400, description: 'Validation error' })
    createUser(@Body() body: CreateUserDto, @Req() req: Request) {
        return this.gatewayService.createUser(body, (req as any).user);
    }

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
    @ApiResponse({
        status: 400,
        description: 'User does not have driver role or profile already exists',
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    createDriver(@Param('id') id: string, @Body() body: CreateDriverDto, @Req() req: Request) {
        return this.gatewayService.createDriver(id, body, (req as any).user);
    }

    @ApiTags('Users')
    @Get('users/:id/driver')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'driver')
    @ApiOperation({
        summary: 'Get driver profile',
        description: 'Retrieve the Driver profile for the specified user.',
    })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'Driver profile' })
    @ApiResponse({ status: 404, description: 'User or Driver profile not found' })
    getDriver(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.getDriver(id, (req as any).user);
    }

    @ApiTags('Users')
    @Get('users/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'business_manager', 'driver')
    @ApiOperation({
        summary: 'Get user by ID',
        description: 'Returns user details without password hash.',
    })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'User detail' })
    @ApiResponse({ status: 404, description: 'User not found' })
    getUser(@Param('id') id: string, @Req() req: Request) {
        if ((req as any).user.role === 'driver' && (req as any).user.sub !== id) {
            return { statusCode: 403, message: 'Forbidden' };
        }
        return this.gatewayService.getUser(id, (req as any).user);
    }

    @ApiTags('Users')
    @Patch('users/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'business_manager')
    @ApiOperation({
        summary: 'Update a user',
        description: 'Partially updates a user. Password is re-hashed if provided.',
    })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'User updated' })
    @ApiResponse({ status: 404, description: 'User not found' })
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto, @Req() req: Request) {
        return this.gatewayService.updateUser(id, body, (req as any).user);
    }

    @ApiTags('Users')
    @Delete('users/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher', 'business_manager')
    @ApiOperation({
        summary: 'Deactivate a user',
        description: 'Soft delete: sets user status to inactive.',
    })
    @ApiParam({ name: 'id', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'User deactivated' })
    @ApiResponse({ status: 404, description: 'User not found' })
    deleteUser(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.deleteUser(id, (req as any).user);
    }
}
