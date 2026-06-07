import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}

    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'authentication' };
    }

    @Post('auth/login')
    login(@Body() body: { email: string; password: string }) {
        return this.authenticationService.login(body.email, body.password);
    }
}
