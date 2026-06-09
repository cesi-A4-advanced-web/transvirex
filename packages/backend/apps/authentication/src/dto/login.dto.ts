import { IsEmail, IsString, MinLength } from 'class-validator';

/** DTO for login requests. */
export class LoginDto {
    /** User email address. */
    @IsEmail()
    email: string;

    /** User password (minimum 6 characters). */
    @IsString()
    @MinLength(6)
    password: string;
}
