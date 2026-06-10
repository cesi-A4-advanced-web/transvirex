import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDto {
    @ApiPropertyOptional({ description: 'Hub UUID' })
    @IsUUID()
    @IsOptional()
    hub_id?: string;

    @ApiPropertyOptional({ description: 'Vehicle type (van, truck, refrigerated, flatbed, box)' })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiPropertyOptional({ description: 'License plate number' })
    @IsString()
    @IsOptional()
    license_plate?: string;
}
