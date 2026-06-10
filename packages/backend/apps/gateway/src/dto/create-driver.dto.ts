import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateDriverDto {
    @ApiPropertyOptional({ description: 'Assigned vehicle UUID' })
    @IsOptional()
    @IsUUID()
    vehicle_id?: string;

    @ApiPropertyOptional({ description: 'Driver rating (0–5)', example: 4.5 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    rating?: number;
}
