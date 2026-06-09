import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogFrontendDto {
    @ApiProperty({
        description: 'Log level',
        enum: ['info', 'warn', 'error', 'debug'],
        example: 'info',
    })
    @IsString()
    level: string;

    @ApiProperty({
        description: 'Log message',
        example: 'User clicked on button X',
    })
    @IsString()
    message: string;

    @ApiProperty({
        description: 'Optional metadata',
        required: false,
        example: { userId: 1, page: '/dashboard' },
    })
    @IsOptional()
    metadata?: Record<string, unknown>;
}
