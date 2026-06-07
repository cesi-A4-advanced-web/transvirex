import { Controller, Get } from '@nestjs/common';
import { BillingService } from './billing.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Get('health') // HTTP
    getHealthHttp() {
        return { status: 'ok', service: 'billing' };
    }

    @MessagePattern('health') // RabbitMQ
    getHealth() {
        return { status: 'ok', service: 'billing' };
    }
}
