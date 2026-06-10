import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { InvoiceStatusDto } from './create-invoice.dto';

export class UpdateInvoiceStatusDto {
    @ApiProperty({
        description: 'Target status (quotation → purchase_order → invoice)',
        enum: InvoiceStatusDto,
    })
    @IsEnum(InvoiceStatusDto)
    status: InvoiceStatusDto;
}
