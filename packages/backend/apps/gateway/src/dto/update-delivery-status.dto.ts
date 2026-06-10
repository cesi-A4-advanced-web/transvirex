import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Allowed delivery status values for the status-update request. */
export enum DeliveryStatusEnum {
    planned = 'planned',
    delivering = 'delivering',
    delivered = 'delivered',
    cancelled = 'cancelled',
    blocked = 'blocked',
    delayed = 'delayed',
}

/** Validated DTO for updating a delivery's status with an optional note. */
export class UpdateDeliveryStatusDto {
    @ApiProperty({ description: 'New status', enum: DeliveryStatusEnum })
    @IsEnum(DeliveryStatusEnum)
    status: DeliveryStatusEnum;

    @ApiPropertyOptional({ description: 'Optional note explaining the status change' })
    @IsOptional()
    @IsString()
    note?: string;
}
