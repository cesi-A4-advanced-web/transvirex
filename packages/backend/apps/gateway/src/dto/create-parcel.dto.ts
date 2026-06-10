import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParcelDto {
    @ApiProperty({ description: 'Parcel weight in kg' })
    @IsNumber()
    @Min(0.01)
    weight: number;

    @ApiPropertyOptional({ description: 'Parcel reference (auto-generated if omitted)' })
    @IsString()
    @IsOptional()
    reference?: string;
}
