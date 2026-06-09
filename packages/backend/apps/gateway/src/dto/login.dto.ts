import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO for login requests via the gateway. */
export class LoginDto {
    @ApiProperty({
        description: 'User email address',
        example: 'admin@transvirex.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password (min 6 characters)',
        example: 'password123',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password: string;
}
