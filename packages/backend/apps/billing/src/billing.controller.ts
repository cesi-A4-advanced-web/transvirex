import { Controller, Get } from '@nestjs/common';
import { BillingService } from './billing.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @MessagePattern('health')
    getHealth() {
        return { status: 'ok', service: 'billing' }
    }
}
