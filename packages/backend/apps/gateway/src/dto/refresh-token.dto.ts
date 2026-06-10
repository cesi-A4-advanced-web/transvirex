import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO for refresh-token requests via the gateway. */
export class RefreshTokenDto {
    @ApiProperty({
        description: 'JWT refresh token',
        example: 'eyJhbGciOiJIUzI1NiIs...',
    })
    @IsString()
    refresh_token: string;
}
