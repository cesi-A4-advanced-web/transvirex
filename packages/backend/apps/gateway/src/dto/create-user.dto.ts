import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserRoleDto {
    admin = 'admin',
    dispatcher = 'dispatcher',
    driver = 'driver',
    business_manager = 'business_manager',
}

export enum UserStatusDto {
    active = 'active',
    inactive = 'inactive',
    unavailable = 'unavailable',
}

export class CreateUserDto {
    @ApiPropertyOptional({
        description: 'User reference (auto-generated if omitted)',
        example: 'USR-021',
    })
    @IsOptional()
    @IsString()
    reference?: string;

    @ApiPropertyOptional({ description: 'Hub UUID' })
    @IsOptional()
    @IsString()
    hub_id?: string;

    @ApiPropertyOptional({ description: 'First name', example: 'Jane' })
    @IsOptional()
    @IsString()
    firstname?: string;

    @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
    @IsOptional()
    @IsString()
    lastname?: string;

    @ApiPropertyOptional({ description: 'Phone number', example: '+33612345678' })
    @IsOptional()
    @IsString()
    phone_number?: string;

    @ApiPropertyOptional({ description: 'Work phone number' })
    @IsOptional()
    @IsString()
    work_phone_number?: string;

    @ApiPropertyOptional({ description: 'Email address', example: 'jane.doe@transvirex.fr' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'Work email address' })
    @IsOptional()
    @IsEmail()
    work_email?: string;

    @ApiPropertyOptional({
        description: 'Plain-text password (hashed before storage)',
        minLength: 6,
        example: 'Password123!',
    })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({ description: 'User status', enum: UserStatusDto })
    @IsOptional()
    @IsEnum(UserStatusDto)
    status?: UserStatusDto;

    @ApiPropertyOptional({ description: 'User role', enum: UserRoleDto })
    @IsOptional()
    @IsEnum(UserRoleDto)
    role?: UserRoleDto;
}
