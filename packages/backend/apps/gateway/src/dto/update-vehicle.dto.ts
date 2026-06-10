import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVehicleDto {
    @ApiPropertyOptional({ description: 'Hub UUID' })
    @IsUUID()
    @IsOptional()
    hub_id?: string;

    @ApiPropertyOptional({ description: 'Vehicle type' })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiPropertyOptional({ description: 'License plate number' })
    @IsString()
    @IsOptional()
    license_plate?: string;

    @ApiPropertyOptional({ description: 'Driver UUID to assign, or null to unassign' })
    @IsUUID()
    @IsOptional()
    driver_id?: string | null;
}
