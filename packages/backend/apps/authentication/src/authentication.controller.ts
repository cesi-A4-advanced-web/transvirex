import { Controller } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { MessagePattern } from '@nestjs/microservices';


@Controller()
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}

    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'authentication' }
    }

}
