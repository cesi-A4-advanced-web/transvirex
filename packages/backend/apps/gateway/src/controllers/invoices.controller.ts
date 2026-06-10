import { Roles } from '@app/guards/roles.decorator';
import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateParcelDto } from '../dto/create-parcel.dto';
import { GatewayService } from '../gateway.service';

@Controller()
export class InvoicesController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Invoices')
    @Post('invoices/:id/parcels')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Add a parcel', description: 'Add a parcel to an invoice and recalculate amount.' })
    @ApiParam({ name: 'id', description: 'Invoice UUID' })
    @ApiResponse({ status: 201, description: 'Parcel created' })
    addParcel(@Param('id') id: string, @Body() body: CreateParcelDto, @Req() req: Request) {
        return this.gatewayService.addParcel(id, body, (req as any).user);
    }

    @ApiTags('Invoices')
    @Get('invoices/:id/parcels')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'List parcels', description: 'List all parcels for an invoice.' })
    @ApiParam({ name: 'id', description: 'Invoice UUID' })
    @ApiResponse({ status: 200, description: 'List of parcels' })
    listParcels(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.listParcels(id, (req as any).user);
    }

    @ApiTags('Invoices')
    @Delete('invoices/:id/parcels/:parcelId')
    @ApiBearerAuth('JWT-auth')
    @Roles('admin', 'dispatcher')
    @ApiOperation({ summary: 'Delete a parcel', description: 'Remove a parcel from an invoice and recalculate amount.' })
    @ApiParam({ name: 'id', description: 'Invoice UUID' })
    @ApiParam({ name: 'parcelId', description: 'Parcel UUID' })
    @ApiResponse({ status: 200, description: 'Parcel deleted' })
    deleteParcel(@Param('id') id: string, @Param('parcelId') parcelId: string, @Req() req: Request) {
        return this.gatewayService.deleteParcel(id, parcelId, (req as any).user);
    }
}
