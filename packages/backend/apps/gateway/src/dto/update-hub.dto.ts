import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum HubStatusDto {
    active = 'active',
    inactive = 'inactive',
    unavailable = 'unavailable',
}

export class UpdateHubDto {
    @ApiPropertyOptional({ description: 'Hub name', example: 'Hub Lyon Part-Dieu' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Phone number', example: '+33412345678' })
    @IsOptional()
    @IsString()
    phone_number?: string;

    @ApiPropertyOptional({ description: 'Manager user UUID' })
    @IsOptional()
    @IsString()
    manager_id?: string;

    @ApiPropertyOptional({ description: 'Address UUID' })
    @IsOptional()
    @IsString()
    address_id?: string;

    @ApiPropertyOptional({ description: 'Max parcels per day', example: 500 })
    @IsOptional()
    @IsInt()
    @Min(1)
    capacity_parcels_day?: number;

    @ApiPropertyOptional({ description: 'Hub status', enum: HubStatusDto })
    @IsOptional()
    @IsEnum(HubStatusDto)
    status?: HubStatusDto;
}
