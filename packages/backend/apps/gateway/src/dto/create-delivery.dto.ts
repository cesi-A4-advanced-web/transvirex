import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum DeliveryStatusDto {
    delivered = 'delivered',
    planned = 'planned',
    delivering = 'delivering',
    cancelled = 'cancelled',
    blocked = 'blocked',
    delayed = 'delayed',
}

export class CreateDeliveryDto {
    @ApiProperty({ description: 'Linked invoice UUID' })
    @IsUUID()
    invoices_id: string;

    @ApiPropertyOptional({ description: 'Delivery reference (auto-généré si omis)', example: 'LIV-20260611-A1B2' })
    @IsOptional()
    @IsString()
    reference?: string;

    @ApiPropertyOptional({ description: 'Assigned driver UUID' })
    @IsOptional()
    @IsUUID()
    driver_id?: string;

    @ApiPropertyOptional({ description: 'Scheduled delivery date (ISO 8601)' })
    @IsOptional()
    @IsString()
    scheduled_at?: string;

    @ApiPropertyOptional({ description: 'Delivery status', enum: DeliveryStatusDto })
    @IsOptional()
    @IsEnum(DeliveryStatusDto)
    status?: DeliveryStatusDto;

    @ApiPropertyOptional({ description: 'Delivery notes' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({
        description: 'GPS position history (JSON array)',
        example: [{ lat: 48.8566, lng: 2.3522, ts: '2026-06-10T12:00:00.000Z' }],
    })
    @IsOptional()
    position_history?: unknown;
}
