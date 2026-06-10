import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { DeliveryStatusDto } from './create-delivery.dto';

export class UpdateDeliveryDto {
    @ApiPropertyOptional({ description: 'Linked invoice UUID' })
    @IsOptional()
    @IsUUID()
    invoices_id?: string;

    @ApiPropertyOptional({ description: 'Delivery reference', example: 'DEL-021' })
    @IsOptional()
    @IsString()
    reference?: string;

    @ApiPropertyOptional({ description: 'Assigned driver UUID', nullable: true })
    @IsOptional()
    @IsUUID()
    driver_id?: string | null;

    @ApiPropertyOptional({ description: 'Delivery status', enum: DeliveryStatusDto })
    @IsOptional()
    @IsEnum(DeliveryStatusDto)
    status?: DeliveryStatusDto;

    @ApiPropertyOptional({ description: 'Delivery notes', nullable: true })
    @IsOptional()
    @IsString()
    notes?: string | null;

    @ApiPropertyOptional({ description: 'GPS position history (JSON array)' })
    @IsOptional()
    position_history?: unknown;
}
