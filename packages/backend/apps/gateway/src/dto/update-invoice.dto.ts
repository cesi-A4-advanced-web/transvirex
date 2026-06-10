import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { InvoicePriorityDto, InvoiceServiceTypeDto } from './create-invoice.dto';

export class UpdateInvoiceDto {
    @ApiPropertyOptional({ description: 'Customer UUID' })
    @IsOptional()
    @IsUUID()
    customer_id?: string;

    @ApiPropertyOptional({ description: 'Hub UUID' })
    @IsOptional()
    @IsUUID()
    hub_id?: string;

    @ApiPropertyOptional({ description: 'Pickup address UUID' })
    @IsOptional()
    @IsUUID()
    pickup_address_id?: string;

    @ApiPropertyOptional({ description: 'Delivery address UUID' })
    @IsOptional()
    @IsUUID()
    delivery_address_id?: string;

    @ApiPropertyOptional({ description: 'Business manager user UUID' })
    @IsOptional()
    @IsUUID()
    business_manager_id?: string;

    @ApiPropertyOptional({ description: 'Invoice reference', example: 'INV-021' })
    @IsOptional()
    @IsString()
    reference?: string;

    @ApiPropertyOptional({ description: 'Invoice priority', enum: InvoicePriorityDto })
    @IsOptional()
    @IsEnum(InvoicePriorityDto)
    priority?: InvoicePriorityDto;

    @ApiPropertyOptional({
        description: 'Due date (ISO 8601)',
        example: '2026-12-31T00:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    due_date?: string;

    @ApiPropertyOptional({ description: 'Service type', enum: InvoiceServiceTypeDto })
    @IsOptional()
    @IsEnum(InvoiceServiceTypeDto)
    service_type?: InvoiceServiceTypeDto;

    @ApiPropertyOptional({
        description: 'Payment date (ISO 8601)',
        nullable: true,
    })
    @IsOptional()
    @IsDateString()
    payment_date?: string | null;
}
