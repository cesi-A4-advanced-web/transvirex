import { Controller, Get } from '@nestjs/common';
import { BillingService } from './billing.service';
import { MessagePattern } from '@nestjs/microservices';

/** HTTP and RabbitMQ controller for billing operations. */
@Controller()
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    /** HTTP health-check endpoint. */
    @Get('health')
    getHealthHttp() {
        return { status: 'ok', service: 'billing' };
    }

    /** RabbitMQ health-check handler. */
    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'billing' };
    }
}
