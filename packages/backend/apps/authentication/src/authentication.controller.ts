import { Controller, Get, Post, Body } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

/** HTTP and RabbitMQ controller for authentication operations. */
@Controller()
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}

    /** HTTP health-check endpoint. */
    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'authentication' };
    }

    /** RabbitMQ health-check handler. */
    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'authentication' };
    }

    /** Authenticate a user with email and password. */
    @Post('auth/login')
    login(@Body() body: LoginDto) {
        return this.authenticationService.login(body.email, body.password);
    }

    /** Refresh an expired access token. */
    @Post('auth/refresh')
    refresh(@Body() body: RefreshDto) {
        return this.authenticationService.refresh(body.refresh_token);
    }

    /** Invalidate a refresh token. */
    @Post('auth/logout')
    logout(@Body() body: RefreshDto) {
        return this.authenticationService.logout(body.refresh_token);
    }
}
