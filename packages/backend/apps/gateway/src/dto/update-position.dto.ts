import { IsNumber, IsLatitude, IsLongitude } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO for a driver's GPS position update request — validated latitude and longitude. */
export class UpdatePositionDto {
    @ApiProperty({ description: 'Latitude', example: 45.764043 })
    @IsNumber()
    @IsLatitude()
    lat: number;

    @ApiProperty({ description: 'Longitude', example: 4.835659 })
    @IsNumber()
    @IsLongitude()
    lng: number;
}
