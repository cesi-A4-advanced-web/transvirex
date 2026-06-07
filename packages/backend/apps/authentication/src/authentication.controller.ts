import { Controller, Get, Post, Body } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthenticationService } from './authentication.service';

@Controller()
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}

    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'authentication' };
    }

    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'authentication' };
    }

    @Post('auth/login')
    login(@Body() body: { email: string; password: string }) {
        return this.authenticationService.login(body.email, body.password);
    }

    @Post('auth/refresh')
    refresh(@Body() body: { refresh_token: string }) {
        return this.authenticationService.refresh(body.refresh_token);
    }

    @Post('auth/logout')
    logout(@Body() body: { refresh_token: string }) {
        return this.authenticationService.logout(body.refresh_token);
    }
}
