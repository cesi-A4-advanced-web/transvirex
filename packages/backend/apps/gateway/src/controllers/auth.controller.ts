import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { LoginDto } from '../dto/login.dto';
import { GatewayService } from '../gateway.service';

const ACCESS_TOKEN_TTL = parseInt(process.env.ACCESS_TOKEN_TTL || '900', 10) * 1000;
const REFRESH_TOKEN_TTL = parseInt(process.env.REFRESH_TOKEN_TTL || '604800', 10) * 1000;

const accessTokenCookieOptions = (maxAge: number) => ({
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
});

const refreshTokenCookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
});

@Controller()
export class AuthController {
    constructor(private readonly gatewayService: GatewayService) {}

    @ApiTags('Authentication')
    @Get('auth/me')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get current user',
        description: "Returns the authenticated user's JWT payload (sub, email, role)",
    })
    @ApiResponse({ status: 200, description: 'Current user information' })
    @ApiResponse({ status: 401, description: 'Access token missing or invalid' })
    me(@Req() req: Request) {
        return (req as any).user;
    }

    @ApiTags('Authentication')
    @Public()
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('auth/login')
    @ApiOperation({
        summary: 'Login',
        description: 'Authenticate with email and password. Sets access_token and refresh_token cookies on success.',
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 201, description: 'Login successful - cookies set', schema: { type: 'object', properties: { success: { type: 'boolean', example: true } } } })
    @ApiResponse({ status: 401, description: 'Invalid email or password' })
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
        const data = await this.gatewayService.login(body);
        res.cookie('access_token', data.access_token, accessTokenCookieOptions(ACCESS_TOKEN_TTL));
        res.cookie('refresh_token', data.refresh_token, refreshTokenCookieOptions(REFRESH_TOKEN_TTL));
        return { success: true };
    }

    @ApiTags('Authentication')
    @Public()
    @Post('auth/refresh')
    @ApiOperation({
        summary: 'Refresh tokens',
        description: 'Refresh the access token using the refresh_token cookie set during login.',
    })
    @ApiResponse({ status: 201, description: 'Tokens refreshed - new cookies set' })
    @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refresh_token;
        const data = await this.gatewayService.refresh({ refresh_token: refreshToken });
        res.cookie('access_token', data.access_token, accessTokenCookieOptions(ACCESS_TOKEN_TTL));
        res.cookie('refresh_token', data.refresh_token, refreshTokenCookieOptions(REFRESH_TOKEN_TTL));
        return { success: true };
    }

    @ApiTags('Authentication')
    @Public()
    @Post('auth/logout')
    @ApiOperation({
        summary: 'Logout',
        description: 'Invalidate the refresh token and clear authentication cookies.',
    })
    @ApiResponse({ status: 201, description: 'Logged out successfully - cookies cleared' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refresh_token;
        await this.gatewayService.logout({ refresh_token: refreshToken });
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return { success: true };
    }
}
