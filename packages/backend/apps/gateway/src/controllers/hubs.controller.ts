import { Roles } from '@app/guards/roles.decorator';
import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateHubDto } from '../dto/create-hub.dto';
import { UpdateHubDto } from '../dto/update-hub.dto';
import { GatewayService } from '../gateway.service';

@Controller()
export class HubsController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Hubs')
    @Get('hubs')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'List all hubs' })
    @ApiResponse({ status: 200, description: 'List of hubs' })
    listHubs(@Req() req: Request) {
        return this.gatewayService.listHubs((req as any).user);
    }

    @ApiTags('Hubs')
    @Post('hubs')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Create a new hub' })
    @ApiResponse({ status: 201, description: 'Hub created' })
    createHub(@Body() body: CreateHubDto, @Req() req: Request) {
        return this.gatewayService.createHub(body, (req as any).user);
    }

    @ApiTags('Hubs')
    @Get('hubs/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Get hub detail with stats' })
    @ApiParam({ name: 'id', description: 'Hub UUID' })
    @ApiResponse({ status: 200, description: 'Hub detail with stats' })
    @ApiResponse({ status: 404, description: 'Hub not found' })
    getHub(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.getHub(id, (req as any).user);
    }

    @ApiTags('Hubs')
    @Patch('hubs/:id')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Update hub (capacity, status, etc.)' })
    @ApiParam({ name: 'id', description: 'Hub UUID' })
    @ApiResponse({ status: 200, description: 'Hub updated' })
    @ApiResponse({ status: 404, description: 'Hub not found' })
    updateHub(@Param('id') id: string, @Body() body: UpdateHubDto, @Req() req: Request) {
        return this.gatewayService.updateHub(id, body, (req as any).user);
    }
}
