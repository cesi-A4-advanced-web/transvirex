import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRoleDto, UserStatusDto } from './create-user.dto';

export class UpdateUserDto {
    @ApiPropertyOptional({ description: 'Hub UUID', nullable: true })
    @IsOptional()
    @IsString()
    hub_id?: string | null;

    @ApiPropertyOptional({ description: 'First name' })
    @IsOptional()
    @IsString()
    firstname?: string;

    @ApiPropertyOptional({ description: 'Last name' })
    @IsOptional()
    @IsString()
    lastname?: string;

    @ApiPropertyOptional({ description: 'Phone number' })
    @IsOptional()
    @IsString()
    phone_number?: string;

    @ApiPropertyOptional({ description: 'Work phone number' })
    @IsOptional()
    @IsString()
    work_phone_number?: string;

    @ApiPropertyOptional({ description: 'Email address' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'Work email address' })
    @IsOptional()
    @IsEmail()
    work_email?: string;

    @ApiPropertyOptional({
        description: 'New plain-text password (hashed before storage)',
        minLength: 6,
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
