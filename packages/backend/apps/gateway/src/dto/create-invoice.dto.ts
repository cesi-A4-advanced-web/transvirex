import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum InvoiceServiceTypeDto {
    express = 'express',
    standard = 'standard',
    freight = 'freight',
}

export enum InvoicePriorityDto {
    urgent = 'urgent',
    high = 'high',
    standard = 'standard',
    low = 'low',
}

export enum InvoiceStatusDto {
    quotation = 'quotation',
    purchase_order = 'purchase_order',
    invoice = 'invoice',
}

export class CreateInvoiceDto {
    @ApiProperty({ description: 'Customer UUID' })
    @IsUUID()
    customer_id: string;

    @ApiProperty({ description: 'Hub UUID' })
    @IsUUID()
    hub_id: string;

    @ApiProperty({ description: 'Pickup address UUID' })
    @IsUUID()
    pickup_address_id: string;

    @ApiProperty({ description: 'Delivery address UUID' })
    @IsUUID()
    delivery_address_id: string;

    @ApiProperty({ description: 'Business manager user UUID' })
    @IsUUID()
    business_manager_id: string;

    @ApiProperty({ description: 'Invoice reference', example: 'INV-021' })
    @IsString()
    reference: string;

    @ApiProperty({ description: 'Invoice priority', enum: InvoicePriorityDto })
    @IsEnum(InvoicePriorityDto)
    priority: InvoicePriorityDto;

    @ApiProperty({
        description: 'Due date (ISO 8601)',
        example: '2026-12-31T00:00:00.000Z',
    })
    @IsDateString()
    due_date: string;

    @ApiPropertyOptional({ description: 'Service type', enum: InvoiceServiceTypeDto })
    @IsOptional()
    @IsEnum(InvoiceServiceTypeDto)
    service_type?: InvoiceServiceTypeDto;

    @ApiPropertyOptional({
        description: 'Payment date (ISO 8601)',
        example: '2026-06-01T00:00:00.000Z',
        nullable: true,
    })
    @IsOptional()
    @IsDateString()
    payment_date?: string | null;
}
